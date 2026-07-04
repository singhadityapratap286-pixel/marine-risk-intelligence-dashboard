import { useState } from "react";

export default function AccountPanel() {
  const [mode,setMode]=useState("signin");

  const submit=(e)=>{
    e.preventDefault();
    alert(mode==="signin"?"Sign in demo":"Account created (demo)");
  };

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-6">
      <h2 className="text-3xl font-bold">👤 Account</h2>
      <p className="text-slate-400 mt-2">
        Sign in to submit reports and tickets under your name
      </p>

      <div className="flex justify-center mt-8">
        <div className="w-full max-w-md bg-slate-900 rounded-xl p-6 border border-slate-700">
          <div className="flex gap-2 mb-6">
            <button
              onClick={()=>setMode("signin")}
              className={`px-4 py-2 rounded ${mode==="signin"?"bg-emerald-600":"bg-slate-700"}`}>
              Sign in
            </button>

            <button
              onClick={()=>setMode("signup")}
              className={`px-4 py-2 rounded ${mode==="signup"?"bg-emerald-600":"bg-slate-700"}`}>
              Create account
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full rounded bg-slate-800 border border-slate-700 p-3 outline-none"/>
            </div>

            <div>
              <label className="block text-sm mb-2">Password</label>
              <input
                type="password"
                className="w-full rounded bg-slate-800 border border-slate-700 p-3 outline-none"/>
            </div>

            {mode==="signup" && (
              <div>
                <label className="block text-sm mb-2">Confirm Password</label>
                <input
                  type="password"
                  className="w-full rounded bg-slate-800 border border-slate-700 p-3 outline-none"/>
              </div>
            )}

            <button
              className="w-full bg-emerald-600 hover:bg-emerald-700 py-3 rounded-lg font-bold">
              {mode==="signin"?"Sign In":"Create Account"}
            </button>
          </form>

          <p className="text-xs text-slate-500 mt-6 text-center">
            Backend not connected. This is a frontend demo.
          </p>
        </div>
      </div>
    </div>
  );
}
