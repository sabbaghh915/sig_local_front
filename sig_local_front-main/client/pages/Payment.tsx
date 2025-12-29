import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Car, CreditCard, ArrowLeft, CheckCircle, DollarSign, Calendar, User, FileText } from "lucide-react";

import {
  INTERNAL_VEHICLE_TYPES,
  INSURANCE_CATEGORIES,
  CLASSIFICATIONS,
  PERIODS_MONTHS,
  BORDER_VEHICLE_TYPES,
} from "../constants/insuranceOptions";

interface VehicleDataView {
  ownerName: string;
  nationalId: string;
  phoneNumber: string;
  plateNumber: string;
  brand: string;
  model: string;
  year: string;
  policyDuration?: string;
  coverage?: string;

  vehicleId?: string;
}

type PricingInput =
  | {
    insuranceType: "internal";
    vehicleCode: string;
    category: string;
    classification: string; // "0" | "1" | "2" | "3"
    months: number;
  }
  | {
    insuranceType: "border";
    borderVehicleType: string;
    months: number;
  };

type QuoteBreakdown = {
  netPremium: number;
  stampFee: number;
  warEffort: number;
  martyrFund: number;
  localAdministration: number;
  reconstruction: number;
  total: number;
};

function durationToMonths(duration?: string) {
  if (!duration) return 12;
  const d = String(duration).toLowerCase();
  if (d.includes("1year") || d.includes("year") || d.includes("12")) return 12;
  if (d.includes("6")) return 6;
  if (d.includes("3")) return 3;
  if (d.includes("2")) return 2;
  if (d.includes("1")) return 1;
  return 12;
}

function safeNum(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("ar-SY", {
    style: "currency",
    currency: "SYP",
    minimumFractionDigits: 0,
  }).format(Math.round(amount));
}

export default function Payment() {
  const navigate = useNavigate();

  const [vehicleData, setVehicleData] = useState<VehicleDataView | null>(null);
  const [storageKey, setStorageKey] = useState<"vehicleData" | "foreignVehicleData" | null>(null);

  const [paymentMethod, setPaymentMethod] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const [pricingInput, setPricingInput] = useState<PricingInput | null>(null);

  const [quote, setQuote] = useState<QuoteBreakdown | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // خيارات آمنة (لو شكل الثوابت مختلف)
  const internalVehicleOptions = useMemo(
    () =>
      (INTERNAL_VEHICLE_TYPES as unknown as any[])?.map((o) => ({
        value: String(o.value ?? o.code ?? o.id ?? ""),
        label: String(o.label ?? o.name ?? o.title ?? o.value ?? ""),
      })) ?? [],
    []
  );

  const categoryOptions = useMemo(
    () =>
      (INSURANCE_CATEGORIES as unknown as any[])?.map((o) => ({
        value: String(o.value ?? o.code ?? o.id ?? ""),
        label: String(o.label ?? o.name ?? o.title ?? o.value ?? ""),
      })) ?? [],
    []
  );

  const classificationOptions = useMemo(
    () =>
      (CLASSIFICATIONS as unknown as any[])?.map((o) => ({
        value: String(o.value ?? o.code ?? o.id ?? ""),
        label: String(o.label ?? o.name ?? o.title ?? o.value ?? ""),
      })) ?? [],
    []
  );

  const periodOptions = useMemo(
    () =>
      (PERIODS_MONTHS as unknown as any[])?.map((o) => ({
        value: String(o.value ?? o.months ?? o.id ?? ""),
        label: String(o.label ?? o.name ?? o.title ?? o.value ?? ""),
      })) ?? [],
    []
  );

  const borderTypeOptions = useMemo(
    () =>
      (BORDER_VEHICLE_TYPES as unknown as any[])?.map((o) => ({
        value: String(o.value ?? o.code ?? o.id ?? ""),
        label: String(o.label ?? o.name ?? o.title ?? o.value ?? ""),
      })) ?? [],
    []
  );

  // 1) اقرأ بيانات المركبة من localStorage وحدد نوع التأمين + التسعير الافتراضي
  useEffect(() => {
    const syrianRaw = localStorage.getItem("vehicleData");
    const foreignRaw = localStorage.getItem("foreignVehicleData");

    if (syrianRaw) {
      const data = JSON.parse(syrianRaw);

      setStorageKey("vehicleData");
      setVehicleData({
        ownerName: data.ownerName ?? "",
        nationalId: data.nationalId ?? data.nationalID ?? "",
        phoneNumber: data.phoneNumber ?? "",
        plateNumber: data.plateNumber ?? "",
        brand: data.brand ?? "",
        model: data.model ?? "",
        year: String(data.year ?? ""),
        policyDuration: data.policyDuration,
        coverage: data.coverage,
        vehicleId: data.vehicleId,
      });

      setPricingInput({
        insuranceType: "internal",
        vehicleCode: data.vehicleCode ?? data.internalVehicleType ?? "",
        category: data.category ?? "",
        classification: String(data.classification ?? "0"),
        months: Number(data.months ?? durationToMonths(data.policyDuration)),
      });

      return;
    }

    if (foreignRaw) {
      const data = JSON.parse(foreignRaw);

      setStorageKey("foreignVehicleData");
      setVehicleData({
        ownerName: data.ownerName ?? "",
        nationalId: data.passportNumber ?? data.nationalId ?? "",
        phoneNumber: data.phoneNumber ?? "",
        plateNumber: data.plateNumber ?? "",
        brand: data.brand ?? "",
        model: data.model ?? "",
        year: String(data.year ?? ""),
        policyDuration: data.policyDuration,
        coverage: data.coverage,
        vehicleId: data.vehicleId,
      });

      setPricingInput({
        insuranceType: "border",
        borderVehicleType: data.borderVehicleType ?? "",
        months: Number(data.insuranceMonths ?? durationToMonths(data.policyDuration)),
      });

      return;
    }

    navigate("/");
  }, [navigate]);

  // 2) استدعاء الباك لحساب السعر عند تغيّر pricingInput
  useEffect(() => {
    const run = async () => {
      if (!pricingInput) return;

      // تحقق سريع من اكتمال الحقول
      if (pricingInput.insuranceType === "internal") {
        if (!pricingInput.vehicleCode || !pricingInput.category || !pricingInput.classification || !pricingInput.months) {
          setQuote(null);
          return;
        }
      } else {
        if (!pricingInput.borderVehicleType || !pricingInput.months) {
          setQuote(null);
          return;
        }
      }

      try {
        setQuoteLoading(true);
        setQuoteError(null);

        const token = localStorage.getItem("authToken");
        const res = await fetch("/api/insurance/calculate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(pricingInput),
        });

        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);

        // ✅ الباك عندك يرجع: { insuranceType, inputs, breakdown, total }
        const payload = json?.data ?? json;
        const breakdown = payload?.breakdown ?? payload; // دعم التوافق لو رجع مسطح

        setQuote({
          netPremium: safeNum(breakdown?.netPremium),
          stampFee: safeNum(breakdown?.stampFee),
          warEffort: safeNum(breakdown?.warEffort ?? breakdown?.warFee),
          martyrFund: safeNum(breakdown?.martyrFund ?? breakdown?.martyrFee),
          localAdministration: safeNum(breakdown?.localAdministration ?? breakdown?.localFee),
          reconstruction: safeNum(breakdown?.reconstruction ?? breakdown?.reconFee),
          total: safeNum(payload?.total ?? breakdown?.total),
        });
      } catch (e: any) {
        setQuote(null);
        setQuoteError(e?.message || "فشل حساب التأمين");
      } finally {
        setQuoteLoading(false);
      }
    };

    run();
  }, [pricingInput]);

  // 3) الدفع وتسجيل payment
  const getStoredVehicle = () => {
    const sy = localStorage.getItem("vehicleData");
    if (sy) return { key: "vehicleData", data: JSON.parse(sy) };

    const fr = localStorage.getItem("foreignVehicleData");
    if (fr) return { key: "foreignVehicleData", data: JSON.parse(fr) };

    return null;
  };

  const handlePayment = async () => {
    if (!vehicleData || !paymentMethod) return;

    // لازم يكون عندك quote محسوب
    if (!quote || !pricingInput) {
      alert("احسب السعر أولاً من بيانات التسعير");
      return;
    }

    setIsProcessing(true);

    try {
      const stored = getStoredVehicle();
      const vehicleId = stored?.data?.vehicleId || vehicleData.vehicleId;

      if (!vehicleId || typeof vehicleId !== "string") {
        alert("خطأ: vehicleId غير موجود أو ليس نصاً");
        return;
      }

      // ✅ 1) حدّث المركبة وخزّن التسعير + التفصيل داخل DB
      const { vehicleApi, paymentApi } = await import("../services/api");

      await vehicleApi.update(vehicleId, {
        pricing: {
          ...pricingInput,
          quote, // QuoteBreakdown
        },
      });

      // ✅ 2) أنشئ سجل الدفع (حقول أساسية فقط)
      const policyNumber = `POL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const payRes = await paymentApi.create({
        vehicleId,
        policyNumber,
        amount: quote.total,
        paymentMethod: paymentMethod as any,
        paidBy: vehicleData.ownerName,
        payerPhone: vehicleData.phoneNumber,
        paymentStatus: "completed",
        receiptNumber: "", // backend يولده
      });

      if (payRes?.success && payRes.data?._id) {
        const paymentId = payRes.data._id;
        setPaymentCompleted(true);

        // ✅ مرّر paymentId للـ PDF ليقرأ من DB
        setTimeout(() => {
          navigate(`/pdf?payment=${paymentId}`);
        }, 800);
      } else {
        alert("فشل إنشاء سجل الدفع");
      }
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "حدث خطأ في الدفع");
    } finally {
      setIsProcessing(false);
    }
  };



  if (!vehicleData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (paymentCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <Card className="max-w-md mx-auto shadow-lg">
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">تم الدفع بنجاح!</h2>
            <p className="text-gray-600 mb-4">تمت معالجة عملية الدفع بنجاح وسيتم توجيهك لصفحة إنشاء البوليصة</p>
            <div className="text-sm text-gray-500">جارٍ التوجيه خلال ثواني...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const premium = quote?.total ?? 0;

  const policyDurationLabel =
    vehicleData.policyDuration === "3months"
      ? "3 أشهر"
      : vehicleData.policyDuration === "6months"
        ? "6 أشهر"
        : vehicleData.policyDuration === "12months"
          ? "سنة كاملة"
          : vehicleData.policyDuration
            ? vehicleData.policyDuration
            : `${pricingInput ? (pricingInput as any).months : 12} شهر`;

  const coverageLabel =
    vehicleData.coverage === "third-party"
      ? "تأمين ضد الغير"
      : vehicleData.coverage === "comprehensive"
        ? "تأمين شامل"
        : vehicleData.coverage === "border-insurance"
          ? "تأمين حدود"
          : vehicleData.coverage || "-";

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
                <p className="text-sm text-white/90">إتمام عملية الدفع</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate(-1)} className="border-white/30 text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            {/* Policy Summary */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  ملخص البوليصة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary-600" />
                      <span className="font-medium">المؤمن له:</span>
                    </div>
                    <p className="text-lg">{vehicleData.ownerName}</p>
                    <p className="text-sm text-gray-600">الرقم الوطني/الجواز: {vehicleData.nationalId}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-primary-600" />
                      <span className="font-medium">المركبة:</span>
                    </div>
                    <p className="text-lg">
                      {vehicleData.brand} {vehicleData.model} {vehicleData.year}
                    </p>
                    <p className="text-sm text-gray-600">رقم اللوحة: {vehicleData.plateNumber}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-primary-700">مدة التأمين: </span>
                    <Badge variant="secondary">{policyDurationLabel}</Badge>
                  </div>
                  <div>
                    <span className="font-medium text-primary-700">نوع التغطية: </span>
                    <Badge variant={vehicleData.coverage === "comprehensive" ? "default" : "secondary"}>{coverageLabel}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Inputs */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-6 h-6" />
                  بيانات التسعير
                </CardTitle>
                <CardDescription>هذه البيانات تُرسل للباك ليحسب سعر التأمين</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pricingInput?.insuranceType === "internal" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>نوع المركبة (الكود)</Label>
                      <Select
                        value={pricingInput.vehicleCode}
                        onValueChange={(v) =>
                          setPricingInput((prev) =>
                            prev && prev.insuranceType === "internal" ? { ...prev, vehicleCode: v } : prev
                          )
                        }
                      >
                        <SelectTrigger className="text-right">
                          <SelectValue placeholder="اختر نوع المركبة" />
                        </SelectTrigger>
                        <SelectContent>
                          {internalVehicleOptions.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>الفئة</Label>
                      <Select
                        value={pricingInput.category}
                        onValueChange={(v) =>
                          setPricingInput((prev) =>
                            prev && prev.insuranceType === "internal" ? { ...prev, category: v } : prev
                          )
                        }
                      >
                        <SelectTrigger className="text-right">
                          <SelectValue placeholder="اختر الفئة" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>التصنيف</Label>
                      <Select
                        value={pricingInput.classification}
                        onValueChange={(v) =>
                          setPricingInput((prev) =>
                            prev && prev.insuranceType === "internal" ? { ...prev, classification: v } : prev
                          )
                        }
                      >
                        <SelectTrigger className="text-right">
                          <SelectValue placeholder="اختر التصنيف" />
                        </SelectTrigger>
                        <SelectContent>
                          {classificationOptions.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>المدة بالأشهر</Label>
                      <Select
                        value={String(pricingInput.months)}
                        onValueChange={(v) =>
                          setPricingInput((prev) =>
                            prev && prev.insuranceType === "internal" ? { ...prev, months: Number(v) } : prev
                          )
                        }
                      >
                        <SelectTrigger className="text-right">
                          <SelectValue placeholder="اختر المدة" />
                        </SelectTrigger>
                        <SelectContent>
                          {periodOptions.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {pricingInput?.insuranceType === "border" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>نوع التأمين الحدودي</Label>
                      <Select
                        value={pricingInput.borderVehicleType}
                        onValueChange={(v) =>
                          setPricingInput((prev) =>
                            prev && prev.insuranceType === "border" ? { ...prev, borderVehicleType: v } : prev
                          )
                        }
                      >
                        <SelectTrigger className="text-right">
                          <SelectValue placeholder="اختر نوع التأمين الحدودي" />
                        </SelectTrigger>
                        <SelectContent>
                          {borderTypeOptions.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>المدة بالأشهر</Label>
                      <Select
                        value={String(pricingInput.months)}
                        onValueChange={(v) =>
                          setPricingInput((prev) =>
                            prev && prev.insuranceType === "border" ? { ...prev, months: Number(v) } : prev
                          )
                        }
                      >
                        <SelectTrigger className="text-right">
                          <SelectValue placeholder="اختر المدة" />
                        </SelectTrigger>
                        <SelectContent>
                          {periodOptions.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {quoteLoading && (
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    جارٍ حساب السعر من الباك...
                  </div>
                )}

                {quoteError && (
                  <Alert variant="destructive">
                    <AlertDescription className="text-right">{quoteError}</AlertDescription>
                  </Alert>
                )}

                {!quoteLoading && !quoteError && !quote && (
                  <Alert>
                    <AlertDescription className="text-right">اختر بيانات التسعير أعلاه ليتم حساب السعر.</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-6 h-6" />
                  طريقة الدفع
                </CardTitle>
                <CardDescription>اختر طريقة الدفع المناسبة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">طريقة الدفع *</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="text-right">
                      <SelectValue placeholder="اختر طريقة الدفع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">دفع نقدي</SelectItem>
                      <SelectItem value="bank-transfer">تحويل بنكي</SelectItem>
                      <SelectItem value="card">بطاقة ائتمانية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentMethod === "card" && (
                  <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">رقم البطاقة</Label>
                        <Input id="cardNumber" placeholder="1234 5678 9012 3456" className="text-left" dir="ltr" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">تاريخ الانتهاء</Label>
                        <Input id="expiryDate" placeholder="MM/YY" className="text-left" dir="ltr" />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "bank-transfer" && (
                  <Alert>
                    <AlertDescription className="text-right">
                      <strong>معلومات التحويل البنكي:</strong>
                      <br />
                      البنك: البنك التجاري السوري
                      <br />
                      رقم الحساب: 123456789
                      <br />
                      الرقم المرجعي: {vehicleData.plateNumber}-{Date.now()}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right */}
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-6 h-6" />
                  ملخص المبلغ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quote ? (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>البدل الصافي:</span>
                      <span>{formatCurrency(quote.netPremium)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>رسم الطابع:</span>
                      <span>{formatCurrency(quote.stampFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>المجهود الحربي:</span>
                      <span>{formatCurrency(quote.warEffort)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>طابع الشهيد:</span>
                      <span>{formatCurrency(quote.martyrFund)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الإدارة المحلية:</span>
                      <span>{formatCurrency(quote.localAdministration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>إعادة الإعمار:</span>
                      <span>{formatCurrency(quote.reconstruction)}</span>
                    </div>

                    <Separator />

                    <div className="flex justify-between text-lg font-bold">
                      <span>المبلغ الإجمالي:</span>
                      <span className="text-primary">{formatCurrency(premium)}</span>
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <AlertDescription className="text-right">
                      لا يوجد سعر محسوب حالياً. الرجاء اختيار بيانات التسعير.
                    </AlertDescription>
                  </Alert>
                )}

                <Button onClick={handlePayment} disabled={!paymentMethod || isProcessing || !quote} className="w-full h-12 text-lg">
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      جارٍ المعالجة...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      تأكيد الدفع
                    </div>
                  )}
                </Button>

                <div className="text-xs text-center text-gray-500 mt-4">جميع المعاملات آمنة ومشفرة</div>
              </CardContent>
            </Card>

            {/* Policy Validity */}
            <Card className="bg-primary-50 border-primary-200">
              <CardHeader>
                <CardTitle className="text-primary-800 text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  صلاحية البوليصة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>تاريخ البداية:</span>
                    <span>{new Date().toLocaleDateString("ar-SY")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>تاريخ الانتهاء:</span>
                    <span>
                      {(() => {
                        const endDate = new Date();
                        const m =
                          pricingInput?.insuranceType === "border"
                            ? (pricingInput as any).months
                            : pricingInput?.insuranceType === "internal"
                              ? (pricingInput as any).months
                              : durationToMonths(vehicleData.policyDuration);

                        endDate.setMonth(endDate.getMonth() + Number(m || 12));
                        return endDate.toLocaleDateString("ar-SY");
                      })()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
