const BASE_URL = 'http://4.224.186.213/evaluation-service';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiIyM2IwMWExMjc1QHN2ZWN3LmVkdS5pbiIsImV4cCI6MTc4MjM4MjAxNywiaWF0IjoxNzgyMzgxMTE3LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiYTI1OTA3OWQtMTkwMC00YzEyLThjYjYtNmU4ZDVkMzU1NmRhIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoidmFyc2hhIGthcnVtdXJpIiwic3ViIjoiODNiM2IxM2YtODQxOC00MGNjLTg1NjAtNjhlMzg0YWFmODJmIn0sImVtYWlsIjoiMjNiMDFhMTI3NUBzdmVjdy5lZHUuaW4iLCJuYW1lIjoidmFyc2hhIGthcnVtdXJpIiwicm9sbE5vIjoiMjNiMDFhMTI3NSIsImFjY2Vzc0NvZGUiOiJhaFhqdnAiLCJjbGllbnRJRCI6IjgzYjNiMTNmLTg0MTgtNDBjYy04NTYwLTY4ZTM4NGFhZjgyZiIsImNsaWVudFNlY3JldCI6IktyV1Z4aGp3UFplaGdTRXEifQ.rW4B_kjQ71oR_n_dHY96sVX3b6Bgkzz9Wx80nNobj7k'; 

// Reusable Logging Middleware Function
export async function logEvent(level, packageName, message) {
  try {
    await fetch(`${BASE_URL}/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({
        stack: "frontend",
        level: level,
        package: packageName,
        message: message
      })
    });
  } catch (err) {
    console.error("Logging failed:", err);
  }
}

// Fetch Notifications Function
export async function fetchNotifications() {
  try {
    await logEvent("info", "api", "Attempting to fetch notifications from evaluation server");
    const response = await fetch(`${BASE_URL}/notifications`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    const data = await response.json();
    await logEvent("info", "api", "Successfully fetched notifications data");
    return data.notifications;
  } catch (err) {
    await logEvent("error", "api", `Failed to fetch notifications: ${err.message}`);
    throw err;
  }
}