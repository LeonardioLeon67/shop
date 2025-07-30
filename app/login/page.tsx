"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 首先尝试管理员登录
      const adminResponse = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.email, // 管理员使用用户名，但输入框是email
          password: form.password,
        }),
      });

      if (adminResponse.ok) {
        const adminData = await adminResponse.json();
        router.push("/admin");
        return;
      }

      // 如果管理员登录失败，尝试普通用户登录
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        // 普通用户登录成功，保存用户信息到localStorage
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push(redirect);
      } else {
        setError(data.message || "登录失败");
      }
    } catch (error) {
      console.error("登录失败:", error);
      setError("登录失败，请重试");
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
                <h1 className="text-2xl font-bold text-gray-400">用户登录</h1>
                <p className="text-gray-500 mt-2">登录浣熊订阅账户</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-gray-400">邮箱地址</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    placeholder="请输入邮箱地址"
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
                    placeholder="请输入您的密码"
                  />
                </div>

                {error && (
                  <div className="alert alert-error">
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn bg-blue-300 hover:bg-blue-400 text-gray-500 border-blue-300 hover:border-blue-400 w-full text-base font-normal relative"
                >
                  {loading && (
                    <span className="loading loading-spinner loading-sm absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"></span>
                  )}
                  <span className={loading ? "opacity-0" : ""}>登录</span>
                </button>
              </form>

              <div className="divider">或</div>

              <div className="text-center">
                <p className="text-gray-500">
                  还没有账户？
                  <Link href="/register" className="text-blue-400 hover:underline ml-1">
                    立即注册
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