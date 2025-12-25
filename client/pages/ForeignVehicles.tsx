import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Globe,
  User,
  CreditCard,
  FileText,
  Calendar,
  MapPin,
  Phone,
  IdCard,
  Home,
} from "lucide-react";
import { cn } from "../lib/utils";
import { BORDER_VEHICLE_TYPES } from "../constants/insuranceOptions";

interface ForeignVehicleData {
  // Owner Information
  ownerName: string;
  nationality: string;
  passportNumber: string;
  phoneNumber: string;
  homeAddress: string;
  localAddress: string;

  // Vehicle Information
  plateNumber: string;
  plateCountry: string;
  chassisNumber: string;
  engineNumber: string;
  brand: string;
  model: string;
  year: string;
  color: string;
  fuelType: string;

  // Entry Information
  entryDate: string;
  exitDate: string;
  entryPoint: string;
  customsDocument: string;

  // Insurance Information
  policyDuration: string;
  coverage: string;
  notes: string;

  // ✅ pricing fields for border insurance
  borderVehicleType: string; // tourist | motorcycle | bus | other
  insuranceMonths: string; // "1" | "2" | "3" | "6" | "12"
}

function monthsToPolicyDuration(months: string) {
  switch (months) {
    case "1":
      return "1month";
    case "2":
      return "2months";
    case "3":
      return "3months";
    case "6":
      return "6months";
    case "12":
      return "12months";
    default:
      return "";
  }
}

function policyDurationLabel(policyDuration: string, insuranceMonths: string) {
  // لو المستخدم اختار الأشهر، اعرضها كأولوية
  if (insuranceMonths) {
    switch (insuranceMonths) {
      case "1":
        return "شهر واحد";
      case "2":
        return "شهرين";
      case "3":
        return "3 أشهر";
      case "6":
        return "6 أشهر";
      case "12":
        return "سنة كاملة";
      default:
        break;
    }
  }

  switch (policyDuration) {
    case "1month":
      return "شهر واحد";
    case "2months":
      return "شهرين";
    case "3months":
      return "3 أشهر";
    case "6months":
      return "6 أشهر";
    case "12months":
      return "سنة كاملة";
    default:
      return policyDuration || "-";
  }
}

export default function ForeignVehicles() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [vehicleData, setVehicleData] = useState<ForeignVehicleData>({
    ownerName: "",
    nationality: "",
    passportNumber: "",
    phoneNumber: "",
    homeAddress: "",
    localAddress: "",

    plateNumber: "",
    plateCountry: "",
    chassisNumber: "",
    engineNumber: "",
    brand: "",
    model: "",
    year: "",
    color: "",
    fuelType: "",

    entryDate: "",
    exitDate: "",
    entryPoint: "",
    customsDocument: "",

    policyDuration: "",
    coverage: "",
    notes: "",

    borderVehicleType: "",
    insuranceMonths: "",
  });

  const handleInputChange = (field: keyof ForeignVehicleData, value: string) => {
    setVehicleData((prev) => {
      // ✅ لو غيّر مدة الأشهر، خلّي policyDuration يتوافق تلقائياً (حتى لا يضيع بالسجلات)
      if (field === "insuranceMonths") {
        return {
          ...prev,
          insuranceMonths: value,
          policyDuration: monthsToPolicyDuration(value) || prev.policyDuration,
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleNextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return Boolean(
          vehicleData.ownerName &&
            vehicleData.nationality &&
            vehicleData.passportNumber &&
            vehicleData.phoneNumber
        );
      case 2:
        return Boolean(
          vehicleData.plateNumber &&
            vehicleData.plateCountry &&
            vehicleData.chassisNumber &&
            vehicleData.brand &&
            vehicleData.model
        );
      case 3:
        return Boolean(
          vehicleData.entryDate &&
            vehicleData.exitDate &&
            vehicleData.entryPoint &&
            vehicleData.customsDocument
        );
      case 4:
        // ✅ لازم مدة + نوع تغطية + نوع حدودي + مدة بالأشهر
        return Boolean(
          (vehicleData.insuranceMonths || vehicleData.policyDuration) &&
            vehicleData.coverage &&
            vehicleData.borderVehicleType
        );
      default:
        return false;
    }
  };

  const steps = [
    { number: 1, title: "بيانات المالك", icon: User },
    { number: 2, title: "بيانات المركبة", icon: Globe },
    { number: 3, title: "بيانات الدخول", icon: MapPin },
    { number: 4, title: "بيانات التأمين", icon: FileText },
  ];

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    try {
      // ✅ address مطلوب في Schema
      const address =
        (vehicleData.localAddress || "").trim() ||
        (vehicleData.homeAddress || "").trim();

      if (!address) {
        setError("العنوان مطلوب (العنوان المؤقت في سوريا أو عنوان بلد الإقامة)");
        setIsLoading(false);
        return;
      }

      // ✅ تجهيز pricing للحدودي (سيُستخدم في Payment.tsx لاحقاً)
      const pricing = {
        insuranceType: "border" as const,
        borderType: vehicleData.borderVehicleType,
        periodMonths: Number(
          vehicleData.insuranceMonths ||
            (vehicleData.policyDuration === "12months"
              ? 12
              : vehicleData.policyDuration === "6months"
              ? 6
              : vehicleData.policyDuration === "3months"
              ? 3
              : vehicleData.policyDuration === "2months"
              ? 2
              : vehicleData.policyDuration === "1month"
              ? 1
              : 12)
        ),
      };

      // ✅ payload للباك (مع address)
      const vehiclePayload = {
        vehicleType: "foreign" as const,

        ownerName: vehicleData.ownerName,
        nationalId: vehicleData.passportNumber, // بعض الباك يستخدم nationalId للبحث
        passportNumber: vehicleData.passportNumber,
        nationality: vehicleData.nationality,
        phoneNumber: vehicleData.phoneNumber,
        address,

        plateNumber: vehicleData.plateNumber,
        chassisNumber: vehicleData.chassisNumber,
        engineNumber: vehicleData.engineNumber || undefined,
        brand: vehicleData.brand,
        model: vehicleData.model,
        year: Number(vehicleData.year || 0),
        color: vehicleData.color || undefined,
        fuelType: vehicleData.fuelType || undefined,

        plateCountry: vehicleData.plateCountry,
        entryPoint: vehicleData.entryPoint,
        customsDocument: vehicleData.customsDocument,

        entryDate: vehicleData.entryDate
          ? new Date(vehicleData.entryDate).toISOString()
          : undefined,
        exitDate: vehicleData.exitDate
          ? new Date(vehicleData.exitDate).toISOString()
          : undefined,

        policyDuration: vehicleData.policyDuration || undefined,
        coverage: vehicleData.coverage || undefined,
        notes: vehicleData.notes || undefined,

        // (اختياري) نخزن pricing داخل المركبة لو الباك يسمح
        pricing,
      };

      const { vehicleApi } = await import("../services/api");
      const response = await vehicleApi.create(vehiclePayload);

      if (response.success && response.data) {
  localStorage.setItem(
    "foreignVehicleData",
    JSON.stringify({
      ...vehicleData,
      vehicleId: response.data._id,
      nationalId: vehicleData.passportNumber,
    })
  );

  navigate("/payment-foreign");
} else {
  setError("حدث خطأ في حفظ البيانات");
}
    } catch (err: any) {
      console.error("Save vehicle error:", err);
      setError(err?.message || "حدث خطأ في حفظ البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-syrian-red to-red-700 shadow-lg border-b border-red-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  تأمين المركبات الأجنبية
                </h1>
                <p className="text-sm text-white/90">
                  إصدار بوليصة للمركبات الأجنبية
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Home className="w-4 h-4 ml-2" />
                الرئيسية
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/foreign-records")}
                className="border-white/30 text-white hover:bg-white/10"
              >
                <FileText className="w-4 h-4 ml-2" />
                السجلات الأجنبية
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
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all",
                      currentStep >= step.number
                        ? "bg-syrian-red border-syrian-red text-white"
                        : "bg-white border-gray-300 text-gray-400"
                    )}
                  >
                    <step.icon className="w-6 h-6" />
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium mt-2 transition-colors",
                      currentStep >= step.number ? "text-red-700" : "text-gray-400"
                    )}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-1 mx-4 transition-colors",
                      currentStep > step.number ? "bg-syrian-red" : "bg-gray-200"
                    )}
                  />
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
                      onChange={(e) =>
                        handleInputChange("ownerName", e.target.value)
                      }
                      placeholder="الاسم كما هو مدون في جواز السفر"
                      className="text-right"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationality">الجنسية *</Label>
                    <Select
                      value={vehicleData.nationality}
                      onValueChange={(value) =>
                        handleInputChange("nationality", value)
                      }
                    >
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر الجنسية" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lebanese">لبنانية</SelectItem>
                        <SelectItem value="jordanian">أردنية</SelectItem>
                        <SelectItem value="iraqi">عراقية</SelectItem>
                        <SelectItem value="turkish">تركية</SelectItem>
                        <SelectItem value="palestinian">فلسطينية</SelectItem>
                        <SelectItem value="egyptian">مصرية</SelectItem>
                        <SelectItem value="saudi">سعودية</SelectItem>
                        <SelectItem value="kuwaiti">كويتية</SelectItem>
                        <SelectItem value="emirati">إماراتية</SelectItem>
                        <SelectItem value="other">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="passportNumber"
                      className="flex items-center gap-2"
                    >
                      <IdCard className="w-4 h-4" />
                      رقم جواز السفر *
                    </Label>
                    <Input
                      id="passportNumber"
                      value={vehicleData.passportNumber}
                      onChange={(e) =>
                        handleInputChange("passportNumber", e.target.value)
                      }
                      placeholder="رقم جواز السفر"
                      className="text-right"
                      required
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="phoneNumber"
                      className="flex items-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      رقم الهاتف *
                    </Label>
                    <Input
                      id="phoneNumber"
                      value={vehicleData.phoneNumber}
                      onChange={(e) =>
                        handleInputChange("phoneNumber", e.target.value)
                      }
                      placeholder="رقم الهاتف للتواصل"
                      className="text-right"
                      required
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="homeAddress"
                      className="flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4" />
                      العنوان في بلد الإقامة
                    </Label>
                    <Input
                      id="homeAddress"
                      value={vehicleData.homeAddress}
                      onChange={(e) =>
                        handleInputChange("homeAddress", e.target.value)
                      }
                      placeholder="العنوان في البلد الأصلي"
                      className="text-right"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="localAddress">العنوان المؤقت في سوريا</Label>
                    <Input
                      id="localAddress"
                      value={vehicleData.localAddress}
                      onChange={(e) =>
                        handleInputChange("localAddress", e.target.value)
                      }
                      placeholder="مكان الإقامة المؤقت في سوريا"
                      className="text-right"
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
                    <Label
                      htmlFor="plateNumber"
                      className="flex items-center gap-2"
                    >
                      <Globe className="w-4 h-4" />
                      رقم اللوحة *
                    </Label>
                    <Input
                      id="plateNumber"
                      value={vehicleData.plateNumber}
                      onChange={(e) =>
                        handleInputChange("plateNumber", e.target.value)
                      }
                      placeholder="رقم لوحة المركبة"
                      className="text-right"
                      required
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plateCountry">دولة التسجيل *</Label>
                    <Select
                      value={vehicleData.plateCountry}
                      onValueChange={(value) =>
                        handleInputChange("plateCountry", value)
                      }
                    >
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر دولة تسجيل المركبة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lebanon">لبنان</SelectItem>
                        <SelectItem value="jordan">الأردن</SelectItem>
                        <SelectItem value="iraq">العراق</SelectItem>
                        <SelectItem value="turkey">تركيا</SelectItem>
                        <SelectItem value="palestine">فلسطين</SelectItem>
                        <SelectItem value="egypt">مصر</SelectItem>
                        <SelectItem value="saudi">السعودية</SelectItem>
                        <SelectItem value="kuwait">الكويت</SelectItem>
                        <SelectItem value="uae">الإمارات</SelectItem>
                        <SelectItem value="other">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chassisNumber">رقم الهيكل *</Label>
                    <Input
                      id="chassisNumber"
                      value={vehicleData.chassisNumber}
                      onChange={(e) =>
                        handleInputChange("chassisNumber", e.target.value)
                      }
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
                      onChange={(e) =>
                        handleInputChange("engineNumber", e.target.value)
                      }
                      placeholder="رقم المحرك"
                      className="text-right"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brand">الماركة *</Label>
                    <Select
                      value={vehicleData.brand}
                      onValueChange={(value) => handleInputChange("brand", value)}
                    >
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر ماركة السيارة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="toyota">تويوتا</SelectItem>
                        <SelectItem value="hyundai">هيونداي</SelectItem>
                        <SelectItem value="kia">كيا</SelectItem>
                        <SelectItem value="nissan">نيسان</SelectItem>
                        <SelectItem value="mercedes">مرسيدس</SelectItem>
                        <SelectItem value="bmw">بي إم دبليو</SelectItem>
                        <SelectItem value="audi">أودي</SelectItem>
                        <SelectItem value="volkswagen">فولكس فاجن</SelectItem>
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
                    <Select
                      value={vehicleData.year}
                      onValueChange={(value) => handleInputChange("year", value)}
                    >
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر سنة الصنع" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 30 }, (_, i) => 2024 - i).map(
                          (year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">لون السيارة</Label>
                    <Select
                      value={vehicleData.color}
                      onValueChange={(value) => handleInputChange("color", value)}
                    >
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر لون السيارة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="white">أبيض</SelectItem>
                        <SelectItem value="black">أسود</SelectItem>
                        <SelectItem value="silver">فضي</SelectItem>
                        <SelectItem value="gray">رمادي</SelectItem>
                        <SelectItem value="red">أحمر</SelectItem>
                        <SelectItem value="blue">أزرق</SelectItem>
                        <SelectItem value="green">أخضر</SelectItem>
                        <SelectItem value="other">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Entry Information */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="entryDate" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      تاريخ الدخول *
                    </Label>
                    <Input
                      id="entryDate"
                      type="date"
                      value={vehicleData.entryDate}
                      onChange={(e) =>
                        handleInputChange("entryDate", e.target.value)
                      }
                      className="text-right"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exitDate" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      تاريخ الخروج المتوقع *
                    </Label>
                    <Input
                      id="exitDate"
                      type="date"
                      value={vehicleData.exitDate}
                      onChange={(e) =>
                        handleInputChange("exitDate", e.target.value)
                      }
                      className="text-right"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="entryPoint" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      نقطة الدخول *
                    </Label>
                    <Select
                      value={vehicleData.entryPoint}
                      onValueChange={(value) =>
                        handleInputChange("entryPoint", value)
                      }
                    >
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر نقطة الدخول" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="damascus-airport">
                          مطار دمشق الدولي
                        </SelectItem>
                        <SelectItem value="aleppo-airport">
                          مطار حلب الدولي
                        </SelectItem>
                        <SelectItem value="nassib">معبر نصيب الحدودي</SelectItem>
                        <SelectItem value="tanf">معبر التنف</SelectItem>
                        <SelectItem value="qasmieh">معبر القاسمية</SelectItem>
                        <SelectItem value="arida">معبر العريضة</SelectItem>
                        <SelectItem value="tal-kalakh">معبر تل كلخ</SelectItem>
                        <SelectItem value="other">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="customsDocument"
                      className="flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      رقم الوثيقة الجمركية *
                    </Label>
                    <Input
                      id="customsDocument"
                      value={vehicleData.customsDocument}
                      onChange={(e) =>
                        handleInputChange("customsDocument", e.target.value)
                      }
                      placeholder="رقم وثيقة العبور الجمركي"
                      className="text-right"
                      required
                      dir="ltr"
                    />
                  </div>
                </div>

                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertDescription className="text-yellow-800 text-right">
                    <strong>تنبيه:</strong> يجب التأكد من صحة تواريخ الدخول والخروج
                    وتطابقها مع الوثائق الجمركية
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Step 4: Insurance Information */}
            {currentStep === 4 && (
              <div className="space-y-6">
                {/* ✅ Dropdowns الخاصة بالتأمين الحدودي */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>نوع التأمين الحدودي *</Label>
                    <Select
                      value={vehicleData.borderVehicleType}
                      onValueChange={(value) =>
                        handleInputChange("borderVehicleType", value)
                      }
                    >
                      <SelectTrigger className="h-12 text-right">
                        <SelectValue placeholder="اختر نوع التأمين الحدودي" />
                      </SelectTrigger>
                      <SelectContent>
                        {BORDER_VEHICLE_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>المدة بالأشهر *</Label>
                    <Select
                      value={vehicleData.insuranceMonths}
                      onValueChange={(v) => handleInputChange("insuranceMonths", v)}
                    >
                      <SelectTrigger className="h-12 text-right">
                        <SelectValue placeholder="اختر المدة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">شهر</SelectItem>
                        <SelectItem value="2">شهرين</SelectItem>
                        <SelectItem value="3">3 أشهر</SelectItem>
                        <SelectItem value="6">6 أشهر</SelectItem>
                        <SelectItem value="12">سنة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* (اختياري) أبقينا policyDuration لواجهة موجودة سابقاً */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="policyDuration" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      مدة البوليصة (اختياري)
                    </Label>
                    <Select
                      value={vehicleData.policyDuration}
                      onValueChange={(value) =>
                        handleInputChange("policyDuration", value)
                      }
                    >
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر مدة التأمين" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1month">شهر واحد</SelectItem>
                        <SelectItem value="2months">شهرين</SelectItem>
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
                    <Select
                      value={vehicleData.coverage}
                      onValueChange={(value) => handleInputChange("coverage", value)}
                    >
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر نوع التغطية" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="third-party">تأمين ضد الغير</SelectItem>
                        <SelectItem value="comprehensive">تأمين شامل</SelectItem>
                        <SelectItem value="border-insurance">تأمين حدود</SelectItem>
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
                    placeholder="أي معلومات إضافية أو ملاحظات خاصة بالمركبة الأجنبية..."
                    className="text-right min-h-[100px]"
                    rows={4}
                  />
                </div>

                {/* Summary Card */}
                <Card className="bg-red-50 border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-800">ملخص البيانات</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-red-700">المالك: </span>
                        <span>{vehicleData.ownerName}</span>
                      </div>
                      <div>
                        <span className="font-medium text-red-700">الجنسية: </span>
                        <span>{vehicleData.nationality}</span>
                      </div>
                      <div>
                        <span className="font-medium text-red-700">رقم اللوحة: </span>
                        <span>
                          {vehicleData.plateNumber} ({vehicleData.plateCountry})
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-red-700">المركبة: </span>
                        <span>
                          {vehicleData.brand} {vehicleData.model} {vehicleData.year}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-red-700">فترة الإقامة: </span>
                        <span>
                          {vehicleData.entryDate} إلى {vehicleData.exitDate}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-red-700">مدة التأمين: </span>
                        <Badge variant="secondary">
                          {policyDurationLabel(vehicleData.policyDuration, vehicleData.insuranceMonths)}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium text-red-700">نوع الحدودي: </span>
                        <Badge variant="outline">{vehicleData.borderVehicleType || "-"}</Badge>
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

              {currentStep < 4 ? (
                <Button
                  onClick={handleNextStep}
                  disabled={!isStepValid(currentStep)}
                  className="flex items-center gap-2 bg-syrian-red hover:bg-red-600"
                >
                  التالي
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid(currentStep) || isLoading}
                  className="flex items-center gap-2 bg-syrian-red hover:bg-red-600"
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
