import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Car, LogIn, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { authApi } from "../services/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (!username || !password) {
        setError("يرجى إدخال اسم المستخدم وكلمة المرور");
        return;
      }

      // Call the login API
      const response = await authApi.login({ username, password });

      if (response.success && response.token && response.user) {
        // Store authentication data
        localStorage.setItem("authToken", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("username", response.user.username);
        localStorage.setItem("employeeName", response.user.fullName);
        
        navigate("/");
      } else {
        setError(response.message || "اسم المستخدم أو كلمة المرور غير صحيحة");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "حدث خطأ في تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-gray-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Branding */}
        <div className="text-center fade-in">
          <div className="mx-auto w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-6 shadow-lg">
            <Shield className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-primary-900 mb-2">
            منصة التأمين الإلزامي
          </h1>
          <p className="text-primary-600 text-lg">
            للسيارات في الجمهورية العربية السورية
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl text-primary-800">
              تسجيل الدخول
            </CardTitle>
            <CardDescription className="text-primary-600">
              للموظفين المخولين في مكاتب التأمين
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription className="text-right">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-primary-700 font-medium">
                  اسم المستخدم
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="text-right h-12 border-primary-200 focus:border-primary-500 focus:ring-primary-500"
                  placeholder="أدخل اسم المستخدم"
                  required
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-primary-700 font-medium">
                  كلمة المرور
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-right h-12 border-primary-200 focus:border-primary-500 focus:ring-primary-500 pl-12"
                    placeholder="أدخل كلمة المرور"
                    required
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-500 hover:text-primary-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link 
                  to="#" 
                  className="text-sm text-primary-600 hover:text-primary-800 transition-colors"
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className={cn(
                  "w-full h-12 text-lg font-medium",
                  "bg-primary hover:bg-primary-600 text-primary-foreground",
                  "transition-all duration-200 shadow-md hover:shadow-lg",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    جارٍ تسجيل الدخول...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="w-5 h-5" />
                    تسجيل الدخول
                  </div>
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-primary-600">
                  يخضع هذا النظام لقوانين التأمين السورية
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Demo Credentials */}
        <Card className="shadow-lg border-info-200 bg-info-50">
          <CardHeader>
            <CardTitle className="text-info-800 text-lg">
              بيانات تسجيل الدخول المتاحة
            </CardTitle>
            <CardDescription className="text-info-600">
              للاختبار والتجربة
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="bg-white p-3 rounded border">
                <div className="font-medium text-gray-700">مدير النظام:</div>
                <div className="text-gray-600">
                  اسم المستخدم: <code className="bg-gray-100 px-1 rounded">admin</code> |
                  كلمة المرور: <code className="bg-gray-100 px-1 rounded">admin123</code>
                </div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="font-medium text-gray-700">موظف:</div>
                <div className="text-gray-600">
                  اسم المستخدم: <code className="bg-gray-100 px-1 rounded">employee</code> |
                  كلمة المرور: <code className="bg-gray-100 px-1 rounded">employee123</code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-primary-600 space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Car className="w-4 h-4" />
            <span>نظام إصدار بوليصات التأمين الإلزامي</span>
          </div>
          <p>© 2024 جميع الحقوق محفوظة</p>
        </div>
      </div>
    </div>
  );
}
