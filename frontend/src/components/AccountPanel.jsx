import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function AccountPanel() {
  const navigate = useNavigate();
  const location = useLocation();

  const isRegister = location.pathname === "/register";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const submit = (e) => {
    e.preventDefault();

    if (isRegister) {
      if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      alert("Account Created Successfully! (Demo)");
      navigate("/account");
    } else {
      alert("Login Successful! (Demo)");
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-6">

      <h2 className="text-3xl font-bold">
        👤 {isRegister ? "Create Account" : "Account Login"}
      </h2>

      <p className="text-slate-400 mt-2">
        {isRegister
          ? "Create your Marine Dashboard account"
          : "Sign in to continue"}
      </p>

      <div className="flex justify-center mt-8">

        <div className="w-full max-w-md bg-slate-900 rounded-xl p-6 border border-slate-700">

          <form onSubmit={submit} className="space-y-4">

            <div>
              <label className="block mb-2">
                Email
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                className="w-full rounded bg-slate-800 border border-slate-700 p-3"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block mb-2">
                Password
              </label>

              <input
                type="password"
                required
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                className="w-full rounded bg-slate-800 border border-slate-700 p-3"
              />
            </div>

            {isRegister && (

              <div>
                <label className="block mb-2">
                  Confirm Password
                </label>

                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e)=>setConfirmPassword(e.target.value)}
                  className="w-full rounded bg-slate-800 border border-slate-700 p-3"
                />
              </div>

            )}

            <button
              className="w-full bg-emerald-600 hover:bg-emerald-700 py-3 rounded-lg font-bold">

              {isRegister ? "Create Account" : "Sign In"}

            </button>

          </form>

          <div className="text-center mt-6">

            {isRegister ? (

              <button
                onClick={() => navigate("/account")}
                className="text-[#c9a962] hover:underline">

                Already have an account? Sign In

              </button>

            ) : (

              <button
                onClick={() => navigate("/register")}
                className="text-[#c9a962] hover:underline">

                Create New Account

              </button>

            )}

          </div>

          <p className="text-xs text-slate-500 mt-6 text-center">
            Backend authentication will be connected later.
          </p>

        </div>

      </div>

    </div>
  );
}