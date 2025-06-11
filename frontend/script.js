async function analyze() {
  const emailInput = document.getElementById("emailInput");
  const email = emailInput.value.trim(); // Get the email value and trim any whitespace
  const resultBox = document.getElementById("result");

  // Clear previous results and show loading message
  resultBox.textContent = "🧠 Analyzing with AI...";

  try {
    // Make the POST request to the backend
    const res = await fetch("http://localhost:5000/analyze", { // Update port to 5000
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    // Check if the response status is OK
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    // Parse the response data
    const data = await res.json();

    // Display the result based on the backend response
    if (data.status === "success") {
      showToast(
        `✅ ${data.ai_analysis.verdict} - Risk Score: ${data.risk_score}%`,
        data.ai_analysis.verdict === "YES" ? "error" : "success"
      );
      resultBox.textContent = JSON.stringify(data.ai_analysis.reasoning, null, 2);
    } else {
      showToast("❌ Failed to analyze email.", "error");
      resultBox.textContent = "Failed to analyze email.";
    }
  } catch (err) {
    showToast("🚫 Network error: " + err.message, "error");
    resultBox.textContent = "❌ Error: " + err.message;
  }
}

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

  // Automatically hide the toast after 3 seconds
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => document.body.removeChild(toast), 600);
  }, 3000);
}