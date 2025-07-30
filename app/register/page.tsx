"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 验证密码
    if (form.password !== form.confirmPassword) {
      setError("密码确认不匹配");
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError("密码长度至少6位");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          name: form.name,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/login");
      } else {
        setError(data.message || "注册失败");
      }
    } catch (error) {
      console.error("注册失败:", error);
      setError("注册失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-400">用户注册</h1>
                <p className="text-gray-500 mt-2">创建浣熊订阅账户</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-gray-400">用户名</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="请输入您的用户名"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-gray-400">邮箱地址</span>
                  </label>
                  <input
                    type="email"
                    className="input input-bordered"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    placeholder="请输入您的邮箱"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-gray-400">密码</span>
                  </label>
                  <input
                    type="password"
                    className="input input-bordered"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    placeholder="请输入密码（至少6位）"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-gray-400">确认密码</span>
                  </label>
                  <input
                    type="password"
                    className="input input-bordered"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    required
                    placeholder="请再次输入密码"
                  />
                </div>

                {error && (
                  <div className="alert alert-error">
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn bg-green-300 hover:bg-green-400 text-gray-500 border-green-300 hover:border-green-400 w-full"
                  disabled={loading}
                >
                  {loading ? "注册中..." : "注册"}
                </button>
              </form>

              <div className="divider">或</div>

              <div className="text-center">
                <p className="text-gray-500">
                  已有账户？
                  <Link href="/login" className="text-blue-400 hover:underline ml-1">
                    立即登录
                  </Link>
                </p>
              </div>

              <div className="text-center mt-4">
                <Link href="/" className="text-gray-500 hover:underline">
                  返回首页
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}