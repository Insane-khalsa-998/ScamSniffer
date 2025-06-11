// showToast() — Displays toast messages
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.right = "20px";
  toast.style.padding = "15px";
  toast.style.borderRadius = "5px";
  toast.style.color = "#fff";
  toast.style.fontWeight = "bold";
  toast.style.zIndex = "10000";
  toast.style.transition = "opacity 0.5s";

  if (type === "success") {
    toast.style.background = "#28a745"; // Green
  } else if (type === "error") {
    toast.style.background = "#dc3545"; // Red
  } else if (type === "info") {
    toast.style.background = "#007bff"; // Blue
  }

  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => document.body.removeChild(toast), 600);
  }, 3000);
}

// updateScoreBar() — Visual risk indicator
function updateScoreBar(score) {
  const scoreBar = document.getElementById("scoreBar");
  const riskScoreLabel = document.getElementById("riskScore");

  let color = "#28a745"; // green
  if (score > 69) {
    color = "#dc3545"; // red
  } else if (score > 30) {
    color = "#ffc107"; // yellow
  }

  scoreBar.style.width = `${score}%`;
  scoreBar.style.backgroundColor = color;
  riskScoreLabel.textContent = score;
}

// getEmailContentFromPage() — Runs inside page context
function getEmailContentFromPage() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
  let text = "";
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement && window.getComputedStyle(node.parentElement).visibility !== "hidden") {
      text += node.textContent + " ";
    }
  }
  return text.trim().substring(0, 2000);
}

// Show sandbox section only if needed
function toggleSandboxSection(show) {
  document.getElementById("sandboxSection").style.display = show ? "block" : "none";
}

// Download file safely (with metadata stripping for images)
async function downloadBlob(blob, originalUrl) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = originalUrl.split("/").pop();
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Remove EXIF data from PNG
async function removePNGMetadata(blob) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((cleanBlob) => {
        resolve(cleanBlob);
      }, "image/png");
    };
    img.src = URL.createObjectURL(blob);
  });
}

// Preview link or file in iframe sandbox
document.getElementById("previewBtn").addEventListener("click", async () => {
  const url = document.getElementById("sandboxUrlInput").value.trim();
  if (!url) return;

  try {
    const frame = document.getElementById("sandboxFrame");
    frame.src = "about:blank";

    const isImage = /\.(png|jpe?g|gif)$/i.test(url);
    const isPDF = /\.pdf$/i.test(url);
    const isDoc = /\.(doc|docx|odt)$/i.test(url);

    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);

    if (isImage) {
      frame.srcdoc = `<img src="${blobUrl}" style="max-width:100%;" />`;
    } else if (isPDF) {
      frame.src = `https://docs.google.com/gview?url=${encodeURIComponent(blobUrl)}&embedded=true`;
    } else if (isDoc) {
      frame.src = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(blobUrl)}`;
    } else {
      frame.src = url; // fallback to iframe
    }

    // File info and safe download
    const fileInfoDiv = document.getElementById("fileInfo");
    fileInfoDiv.innerHTML = `
      <p>📎 File detected: <b>${url.split("/").pop()}</b></p>
      <button id="downloadBtn">⬇️ Download (Safe Mode)</button>
    `;

    document.getElementById("downloadBtn").onclick = async () => {
      if (/\.png$/i.test(url)) {
        const cleanedBlob = await removePNGMetadata(blob);
        downloadBlob(cleanedBlob, url);
      } else {
        downloadBlob(blob, url);
      }
    };

  } catch (err) {
    console.error("Preview error:", err);
    alert("❌ Could not load preview.");
  }
});

// Main Scan Button Handler
document.getElementById("scanBtn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || tabs.length === 0) return;

    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: getEmailContentFromPage
    }, async (results) => {
      if (!results || results.length === 0) {
        document.getElementById("reasoning").textContent = "❌ No result from content script.";
        return;
      }

      const emailText = results[0]?.result || "";

      if (!emailText) {
        document.getElementById("reasoning").textContent = "❌ No email content found.";
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailText })
        });

        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        const data = await res.json();

        showToast(
          `✅ ${data.ai_analysis.verdict} - Risk Score: ${data.risk_score}%`,
          data.ai_analysis.verdict === "YES" ? "error" : "success"
        );

        updateScoreBar(data.risk_score);
        document.getElementById("reasoning").textContent =
          JSON.stringify(data.ai_analysis.reasoning, null, 2);

        // Show sandbox if suspicious links are present
        const hasSuspiciousLinks = data.red_flags.some(flag => flag.includes("🔗 Suspicious link"));
        const hasJavaScriptWarning = data.ai_analysis.reasoning.includes("JavaScript");

        toggleSandboxSection(hasSuspiciousLinks || hasJavaScriptWarning);

      } catch (err) {
        console.error("🚨 Fetch error:", err);
        showToast("🚫 Network error: " + err.message, "error");
        document.getElementById("reasoning").textContent = "❌ Error: " + err.message;
      }
    });
  });
});