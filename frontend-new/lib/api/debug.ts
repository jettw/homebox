// Debug utilities for API client

export function logTokenInfo() {
  if (typeof window === "undefined") return;
  
  const token = localStorage.getItem("auth_token");
  
  console.group("🔐 Auth Token Debug");
  console.log("Token exists:", !!token);
  
  if (token) {
    console.log("Token length:", token.length);
    console.log("Token preview:", token.substring(0, 20) + "...");
    console.log("Has Bearer prefix:", token.startsWith("Bearer"));
    
    // Try to decode JWT payload (if it's a JWT)
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log("Token payload:", payload);
        
        if (payload.exp) {
          const expDate = new Date(payload.exp * 1000);
          const now = new Date();
          const isExpired = expDate < now;
          
          console.log("Expires at:", expDate.toLocaleString());
          console.log("Is expired:", isExpired);
          console.log("Time until expiry:", Math.round((expDate.getTime() - now.getTime()) / 1000 / 60), "minutes");
        }
      }
    } catch (e) {
      console.log("Token is not a JWT or couldn't decode");
    }
  } else {
    console.log("No token found in localStorage");
  }
  
  console.groupEnd();
}

// Call this from browser console: window.debugAuth()
if (typeof window !== "undefined") {
  (window as any).debugAuth = logTokenInfo;
}

