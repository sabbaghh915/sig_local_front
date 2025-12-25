import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Car, User, CreditCard, FileText, Calendar, MapPin, Phone, IdCard, Home } from "lucide-react";
import { cn } from "../lib/utils";

interface VehicleData {
  // Owner Information
  ownerName: string;
  nationalId: string;
  phoneNumber: string;
  address: string;
  
  // Vehicle Information
  plateNumber: string;
  chassisNumber: string;
  engineNumber: string;
  brand: string;
  model: string;
  year: string;
  color: string;
  fuelType: string;
  
  // Insurance Information
  policyDuration: string;
  coverage: string;
  notes: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [vehicleData, setVehicleData] = useState<VehicleData>({
    ownerName: "",
    nationalId: "",
    phoneNumber: "",
    address: "",
    plateNumber: "",
    chassisNumber: "",
    engineNumber: "",
    brand: "",
    model: "",
    year: "",
    color: "",
    fuelType: "",
    policyDuration: "",
    coverage: "",
    notes: ""
  });

  const handleInputChange = (field: keyof VehicleData, value: string) => {
    setVehicleData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      // Save vehicle to MongoDB via API
      const vehiclePayload = {
        ...vehicleData,
        vehicleType: 'syrian' as const,
        year: parseInt(vehicleData.year) || new Date().getFullYear(),
      };

      const { vehicleApi } = await import('../services/api');
      const response = await vehicleApi.create(vehiclePayload);
      
      if (response.success && response.data) {
        // Store vehicle ID and data for payment step
        localStorage.setItem("vehicleData", JSON.stringify({
          ...vehicleData,
          vehicleId: response.data._id,
        }));
        navigate("/payment");
      } else {
        setError("حدث خطأ في حفظ البيانات");
      }
    } catch (err: any) {
      console.error("Save vehicle error:", err);
      setError(err.message || "حدث خطأ في حفظ البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return vehicleData.ownerName && vehicleData.nationalId && vehicleData.phoneNumber && vehicleData.address;
      case 2:
        return vehicleData.plateNumber && vehicleData.chassisNumber && vehicleData.brand && vehicleData.model && vehicleData.year;
      case 3:
        return vehicleData.policyDuration && vehicleData.coverage;
      default:
        return false;
    }
  };

  const steps = [
    { number: 1, title: "بيانات المالك", icon: User },
    { number: 2, title: "بيانات المركبة", icon: Car },
    { number: 3, title: "بيانات التأمين", icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-700 shadow-lg border-b border-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">منصة التأمين الإلزامي</h1>
                <p className="text-sm text-white/90">إصدار بوليصة جديدة</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => navigate("/")} className="flex items-center gap-2 border-white/30 text-white hover:bg-white/10">
                <Home className="w-4 h-4" />
                الرئيسية
              </Button>
              <Button variant="outline" onClick={() => navigate("/syrian-records")} className="flex items-center gap-2 border-white/30 text-white hover:bg-white/10">
                <FileText className="w-4 h-4" />
                السجلات السورية
              </Button>
              <Button variant="outline" onClick={() => {
                localStorage.removeItem("isAuthenticated");
                localStorage.removeItem("username");
                navigate("/login");
              }} className="border-white/30 text-white hover:bg-white/10">
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all",
                    currentStep >= step.number
                      ? "bg-primary border-primary text-white"
                      : "bg-white border-gray-300 text-gray-400"
                  )}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  <span className={cn(
                    "text-sm font-medium mt-2 transition-colors",
                    currentStep >= step.number ? "text-primary" : "text-gray-400"
                  )}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "flex-1 h-1 mx-4 transition-colors",
                    currentStep > step.number ? "bg-primary" : "bg-gray-200"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription className="text-right">{error}</AlertDescription>
          </Alert>
        )}

        {/* Form Content */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              {(() => {
                const IconComponent = steps[currentStep - 1].icon;
                return <IconComponent className="w-6 h-6" />;
              })()}
              {steps[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Step 1: Owner Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="ownerName" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      اسم المالك الكامل *
                    </Label>
                    <Input
                      id="ownerName"
                      value={vehicleData.ownerName}
                      onChange={(e) => handleInputChange("ownerName", e.target.value)}
                      placeholder="اسم المالك كما هو مدون في الهوية"
                      className="text-right"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationalId" className="flex items-center gap-2">
                      <IdCard className="w-4 h-4" />
                      الرقم الوطني *
                    </Label>
                    <Input
                      id="nationalId"
                      value={vehicleData.nationalId}
                      onChange={(e) => handleInputChange("nationalId", e.target.value)}
                      placeholder="الرقم الوطني (11 رقم)"
                      className="text-right"
                      maxLength={11}
                      required
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      رقم الهاتف *
                    </Label>
                    <Input
                      id="phoneNumber"
                      value={vehicleData.phoneNumber}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                      placeholder="رقم الهاتف المحمول"
                      className="text-right"
                      required
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      العنوان *
                    </Label>
                    <Input
                      id="address"
                      value={vehicleData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="المحافظة، المدينة، الحي"
                      className="text-right"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Vehicle Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="plateNumber" className="flex items-center gap-2">
                      <Car className="w-4 h-4" />
                      رقم اللوحة *
                    </Label>
                    <Input
                      id="plateNumber"
                      value={vehicleData.plateNumber}
                      onChange={(e) => handleInputChange("plateNumber", e.target.value)}
                      placeholder="رقم لوحة السيارة"
                      className="text-right"
                      required
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chassisNumber">رقم الهيكل *</Label>
                    <Input
                      id="chassisNumber"
                      value={vehicleData.chassisNumber}
                      onChange={(e) => handleInputChange("chassisNumber", e.target.value)}
                      placeholder="رقم الهيكل (VIN)"
                      className="text-right"
                      required
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="engineNumber">رقم المحرك</Label>
                    <Input
                      id="engineNumber"
                      value={vehicleData.engineNumber}
                      onChange={(e) => handleInputChange("engineNumber", e.target.value)}
                      placeholder="رقم المحرك"
                      className="text-right"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brand">الماركة *</Label>
                    <Select value={vehicleData.brand} onValueChange={(value) => handleInputChange("brand", value)}>
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر ماركة السيارة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="toyota">تويوتا</SelectItem>
                        <SelectItem value="hyundai">هيونداي</SelectItem>
                        <SelectItem value="kia">كيا</SelectItem>
                        <SelectItem value="nissan">نيسان</SelectItem>
                        <SelectItem value="chevrolet">شيفروليه</SelectItem>
                        <SelectItem value="peugeot">بيجو</SelectItem>
                        <SelectItem value="renault">رينو</SelectItem>
                        <SelectItem value="other">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">الموديل *</Label>
                    <Input
                      id="model"
                      value={vehicleData.model}
                      onChange={(e) => handleInputChange("model", e.target.value)}
                      placeholder="موديل السيارة"
                      className="text-right"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year">سنة الصنع *</Label>
                    <Select value={vehicleData.year} onValueChange={(value) => handleInputChange("year", value)}>
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر سنة الصنع" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({length: 25}, (_, i) => 2024 - i).map(year => (
                          <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">لون السيارة</Label>
                    <Select value={vehicleData.color} onValueChange={(value) => handleInputChange("color", value)}>
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر لون السيارة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="white">أبيض</SelectItem>
                        <SelectItem value="black">أسود</SelectItem>
                        <SelectItem value="silver">فضي</SelectItem>
                        <SelectItem value="gray">رمادي</SelectItem>
                        <SelectItem value="red">��حمر</SelectItem>
                        <SelectItem value="blue">أزرق</SelectItem>
                        <SelectItem value="green">أخضر</SelectItem>
                        <SelectItem value="other">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fuelType">نوع الوقود</Label>
                    <Select value={vehicleData.fuelType} onValueChange={(value) => handleInputChange("fuelType", value)}>
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر نوع الوقود" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gasoline">بنزين</SelectItem>
                        <SelectItem value="diesel">ديزل</SelectItem>
                        <SelectItem value="hybrid">هجين</SelectItem>
                        <SelectItem value="electric">كهربائي</SelectItem>
                        <SelectItem value="gas">غاز</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Insurance Information */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="policyDuration" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      مدة البوليصة *
                    </Label>
                    <Select value={vehicleData.policyDuration} onValueChange={(value) => handleInputChange("policyDuration", value)}>
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر مدة التأمين" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3months">3 أشهر</SelectItem>
                        <SelectItem value="6months">6 أشهر</SelectItem>
                        <SelectItem value="12months">سنة كاملة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coverage" className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      نوع التغطية *
                    </Label>
                    <Select value={vehicleData.coverage} onValueChange={(value) => handleInputChange("coverage", value)}>
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر نوع التغطية" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="third-party">تأمين ضد الغير</SelectItem>
                        <SelectItem value="comprehensive">تأمين شامل</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">ملاحظات إضافية</Label>
                  <Textarea
                    id="notes"
                    value={vehicleData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="أي معلومات إضافية أو ملاحظات خاصة..."
                    className="text-right min-h-[100px]"
                    rows={4}
                  />
                </div>

                {/* Summary Card */}
                <Card className="bg-primary-50 border-primary-200">
                  <CardHeader>
                    <CardTitle className="text-primary-800">ملخص البيانات</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-primary-700">المالك: </span>
                        <span>{vehicleData.ownerName}</span>
                      </div>
                      <div>
                        <span className="font-medium text-primary-700">رقم اللوح��: </span>
                        <span>{vehicleData.plateNumber}</span>
                      </div>
                      <div>
                        <span className="font-medium text-primary-700">المركبة: </span>
                        <span>{vehicleData.brand} {vehicleData.model} {vehicleData.year}</span>
                      </div>
                      <div>
                        <span className="font-medium text-primary-700">مدة التأمين: </span>
                        <Badge variant="secondary">{vehicleData.policyDuration === "3months" ? "3 أشهر" : vehicleData.policyDuration === "6months" ? "6 أشهر" : "سنة كاملة"}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Separator className="my-6" />

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                السابق
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  الخطوة {currentStep} من {steps.length}
                </span>
              </div>

              {currentStep < 3 ? (
                <Button
                  onClick={handleNextStep}
                  disabled={!isStepValid(currentStep)}
                  className="flex items-center gap-2"
                >
                  التالي
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid(currentStep) || isLoading}
                  className="flex items-center gap-2 bg-primary hover:bg-primary-600"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      جارٍ الحفظ...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      متابعة للدفع
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
