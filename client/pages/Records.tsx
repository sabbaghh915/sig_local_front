import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Car, Globe, FileText, Home, Eye, TrendingUp, BarChart3, Users, ArrowLeft } from "lucide-react";

export default function Records() {
  const navigate = useNavigate();

  // Mock statistics data
  const syrianStats = {
    total: 127,
    active: 98,
    expired: 23,
    cancelled: 6,
    totalPremium: 18500000
  };

  const foreignStats = {
    total: 43,
    active: 31,
    expired: 8,
    cancelled: 4,
    totalPremium: 7200000
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SY', {
      style: 'currency',
      currency: 'SYP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-700 shadow-lg border-b border-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">مركز السجلات</h1>
                <p className="text-sm text-white/90">إدارة سجلات البوليصات</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => navigate("/")} className="border-white/30 text-white hover:bg-white/10">
                <Home className="w-4 h-4 ml-2" />
                الرئيسية
              </Button>
              <Button variant="outline" onClick={() => {
                localStorage.removeItem("isAuthenticated");
                localStorage.removeItem("username");
                localStorage.removeItem("employeeName");
                navigate("/login");
              }} className="border-white/30 text-white hover:bg-white/10">
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <Alert className="bg-primary-50 border-primary-200">
            <BarChart3 className="w-5 h-5 text-primary" />
            <AlertDescription className="text-primary-800 text-right">
              <strong>مرحباً بك في مركز السجلات</strong><br />
              اختر نوع السجلات التي تريد استعراضها وإدارتها
            </AlertDescription>
          </Alert>
        </div>

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي البوليصات</p>
                  <p className="text-2xl font-bold text-primary">{syrianStats.total + foreignStats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-primary-300" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">ساري المفعول</p>
                  <p className="text-2xl font-bold text-success">{syrianStats.active + foreignStats.active}</p>
                </div>
                <Badge className="w-8 h-8 rounded-full bg-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">منتهي الصلاحية</p>
                  <p className="text-2xl font-bold text-destructive">{syrianStats.expired + foreignStats.expired}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-destructive/50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي الأقساط</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(syrianStats.totalPremium + foreignStats.totalPremium)}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-primary-300" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Records Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Syrian Vehicles Records */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow border-l-4 border-l-primary">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-primary-800">سجلات السيارات السورية</CardTitle>
              <CardDescription className="text-lg">
                بوليصات المركبات المسجلة في الجمهورية العربية السورية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Statistics */}
              <div className="bg-primary-50 p-4 rounded-lg">
                <h4 className="font-bold text-primary-800 mb-3">الإحصائيات:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span>إجمالي البوليصات:</span>
                    <span className="font-bold">{syrianStats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ساري المفعول:</span>
                    <span className="font-bold text-success">{syrianStats.active}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>منتهي الصلاحية:</span>
                    <span className="font-bold text-destructive">{syrianStats.expired}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>إجمالي الأقساط:</span>
                    <span className="font-bold">{formatCurrency(syrianStats.totalPremium)}</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-bold text-blue-800 mb-3">الميزات المتاحة:</h4>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>عرض وتصفية البوليصات</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>تصدير السجلات</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>البحث بالرقم الوطني</span>
                  </li>
                </ul>
              </div>

              <Button 
                onClick={() => navigate("/syrian-records")}
                className="w-full h-12 text-lg bg-primary hover:bg-primary-600"
              >
                عرض سجلات السي��رات السورية
                <ArrowLeft className="w-5 h-5 mr-2" />
              </Button>

              <div className="text-center">
                <Button 
                  variant="outline"
                  onClick={() => navigate("/syrian-vehicles")}
                  className="text-primary border-primary hover:bg-primary-50"
                >
                  إضافة بوليصة سورية جديدة
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Foreign Vehicles Records */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow border-l-4 border-l-syrian-red">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-syrian-red rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-red-800">سجلات السيارات الأجنبية</CardTitle>
              <CardDescription className="text-lg">
                بوليصات المركبات الأجنبية والعابرة والمؤقتة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Statistics */}
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-bold text-red-800 mb-3">الإحصائيات:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span>إجمالي البوليصات:</span>
                    <span className="font-bold">{foreignStats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ساري المفعول:</span>
                    <span className="font-bold text-success">{foreignStats.active}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>منتهي الصلاحية:</span>
                    <span className="font-bold text-destructive">{foreignStats.expired}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>إجمالي الأقساط:</span>
                    <span className="font-bold">{formatCurrency(foreignStats.totalPremium)}</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-bold text-yellow-800 mb-3">الميزات المتاحة:</h4>
                <ul className="space-y-2 text-sm text-yellow-700">
                  <li className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>تصفية حسب الجنسية</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>تتبع فترات الإقامة</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>البحث بجواز السفر</span>
                  </li>
                </ul>
              </div>

              <Button 
                onClick={() => navigate("/foreign-records")}
                className="w-full h-12 text-lg bg-syrian-red hover:bg-red-600"
              >
                عرض سجلات السيارات الأجنبية
                <ArrowLeft className="w-5 h-5 mr-2" />
              </Button>

              <div className="text-center">
                <Button 
                  variant="outline"
                  onClick={() => navigate("/foreign-vehicles")}
                  className="text-red-700 border-red-300 hover:bg-red-50"
                >
                  إضافة بوليصة أجنبية جديدة
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-primary" />
                إجراءات سريعة
              </CardTitle>
              <CardDescription>
                الوصول المباشر للمهام الشائعة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/syrian-records")}
                  className="h-16 flex flex-col gap-2"
                >
                  <Car className="w-6 h-6" />
                  <span>السجلات السورية</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/foreign-records")}
                  className="h-16 flex flex-col gap-2"
                >
                  <Globe className="w-6 h-6" />
                  <span>السجلات الأجنبية</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/syrian-vehicles")}
                  className="h-16 flex flex-col gap-2"
                >
                  <Car className="w-6 h-6" />
                  <span>بوليصة سورية</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/foreign-vehicles")}
                  className="h-16 flex flex-col gap-2"
                >
                  <Globe className="w-6 h-6" />
                  <span>بوليصة أجنبية</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
