import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Car,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  FileText,
  Plus,
  Home,
  Globe,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SyrianPolicyRecord {
  id: string;
  policyNumber: string;
  ownerName: string;
  nationalId: string;
  plateNumber: string;
  brand: string;
  model: string;
  year: string;
  coverage: string;
  startDate: string;
  endDate: string;
  premium: number;
  status: "active" | "expired" | "cancelled";
  createdAt: string;
  vehicleType: "syrian";
}

export default function SyrianRecords() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<SyrianPolicyRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<SyrianPolicyRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SyrianPolicyRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const { vehicleApi } = await import("../services/api");
        const response = await vehicleApi.getAll({ vehicleType: "syrian" });

        if (response?.success && Array.isArray(response.data)) {
          const transformedRecords: SyrianPolicyRecord[] = response.data.map((vehicle: any) => {
            const createdAt = vehicle?.createdAt ? new Date(vehicle.createdAt) : null;

            // إذا عندك startDate/endDate الحقيقيين في الداتا استبدلهم هنا مباشرة
            const startDate = vehicle?.startDate
              ? new Date(vehicle.startDate).toISOString().split("T")[0]
              : createdAt
              ? createdAt.toISOString().split("T")[0]
              : "";

            const endDate = vehicle?.endDate
              ? new Date(vehicle.endDate).toISOString().split("T")[0]
              : createdAt
              ? new Date(new Date(vehicle.createdAt).setFullYear(new Date(vehicle.createdAt).getFullYear() + 1))
                  .toISOString()
                  .split("T")[0]
              : "";

            // status: إذا ما عندك status مخزن، نحسبه حسب endDate
            let status: "active" | "expired" | "cancelled" = vehicle?.status || "active";
            if (!vehicle?.status && endDate) {
              status = new Date(endDate) < new Date() ? "expired" : "active";
            }

            return {
              id: vehicle?._id || "",
              policyNumber: vehicle?.policyNumber || "N/A",
              ownerName: vehicle?.ownerName || "",
              nationalId: vehicle?.nationalId || "",
              plateNumber: vehicle?.plateNumber || "",
              brand: vehicle?.brand || "",
              model: vehicle?.model || "",
              year: vehicle?.year?.toString?.() || "",
              coverage: vehicle?.coverage || "third-party",
              startDate,
              endDate,
              premium: vehicle?.insurance?.total ?? vehicle?.insuranceTotal ?? vehicle?.premium ?? 0,
              status,
              createdAt: vehicle?.createdAt || new Date().toISOString(),
              vehicleType: "syrian",
            };
          });

          setRecords(transformedRecords);
          setFilteredRecords(transformedRecords);
        } else {
          setRecords([]);
          setFilteredRecords([]);
        }
      } catch (error) {
        console.error("Error loading records:", error);
        setRecords([]);
        setFilteredRecords([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecords();
  }, []);

  useEffect(() => {
    let filtered = records;

    // Search (case-insensitive)
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      filtered = filtered.filter((r) => {
        const owner = (r.ownerName || "").toLowerCase();
        const pol = (r.policyNumber || "").toLowerCase();
        const plate = (r.plateNumber || "").toLowerCase();
        const nid = (r.nationalId || "").toLowerCase();
        return owner.includes(term) || pol.includes(term) || plate.includes(term) || nid.includes(term);
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== "all") {
      const today = new Date();
      filtered = filtered.filter((r) => {
        const recordDate = new Date(r.createdAt);
        switch (dateFilter) {
          case "today":
            return recordDate.toDateString() === today.toDateString();
          case "week": {
            const weekAgo = new Date();
            weekAgo.setDate(today.getDate() - 7);
            return recordDate >= weekAgo;
          }
          case "month": {
            const monthAgo = new Date();
            monthAgo.setMonth(today.getMonth() - 1);
            return recordDate >= monthAgo;
          }
          default:
            return true;
        }
      });
    }

    setFilteredRecords(filtered);
  }, [records, searchTerm, statusFilter, dateFilter]);

  const stats = useMemo(() => {
    const total = records.length;
    const active = records.filter((r) => r.status === "active").length;
    const expired = records.filter((r) => r.status === "expired").length;
    const totalPremium = records.reduce((sum, r) => sum + (r.premium || 0), 0);
    return { total, active, expired, totalPremium };
  }, [records]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "ساري المفعول", variant: "default" as const },
      expired: { label: "منتهي الصلاحية", variant: "destructive" as const },
      cancelled: { label: "ملغي", variant: "secondary" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getCoverageLabel = (coverage: string) => (coverage === "third-party" ? "تأمين ضد الغير" : "تأمين شامل");

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("ar-SY", { style: "currency", currency: "SYP", minimumFractionDigits: 0 }).format(amount || 0);

  const formatDate = (dateString: string) => (dateString ? new Date(dateString).toLocaleDateString("ar-SY") : "-");

  // ✅ Actions
  const handlePreview = (id: string) => {
    // معاينة داخل التطبيق
    navigate(`/pdf?policy=${id}`);
  };

  const handleDownload = (id: string) => {
    // تحميل (حسب صفحة pdf عندك)
    // ممكن تخليه window.open ليفتح تبويب جديد
    window.open(`/pdf?policy=${id}&download=true`, "_blank");
  };

  const handleEdit = (id: string) => {
    // يفتح نفس صفحة إنشاء البوليصة لكن بوضع edit
    navigate(`/syrian-vehicles?edit=${id}`);
  };

  const openDeleteDialog = (record: SyrianPolicyRecord) => {
    setDeleteTarget(record);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget?.id) return;

    setIsDeleting(true);
    try {
      const { vehicleApi } = await import("../services/api");

      // دعم أسماء مختلفة للدالة حسب مشروعك
      const delFn =
        (vehicleApi as any).delete ||
        (vehicleApi as any).remove ||
        (vehicleApi as any).deleteOne ||
        (vehicleApi as any).deleteById;

      if (!delFn) {
        throw new Error("delete/remove api method not found in vehicleApi");
      }

      const res = await delFn(deleteTarget.id);

      if (res?.success === false) {
        throw new Error(res?.message || "فشل حذف البوليصة");
      }

      // تحديث الواجهة مباشرة
      setRecords((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setFilteredRecords((prev) => prev.filter((r) => r.id !== deleteTarget.id));

      setDeleteOpen(false);
      setDeleteTarget(null);
    } catch (e) {
      console.error("Delete error:", e);
      alert("تعذر حذف البوليصة. تحقق من السيرفر أو الصلاحيات.");
    } finally {
      setIsDeleting(false);
    }
  };

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
                <h1 className="text-xl font-bold text-white">سجلات السيارات السورية</h1>
                <p className="text-sm text-white/90">تأمين المركبات المسجلة في سوريا</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/records")}
                className="border-white/30 text-white hover:bg-white/10"
              >
                <FileText className="w-4 h-4 ml-2" />
                كل السجلات
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/foreign-records")}
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Globe className="w-4 h-4 ml-2" />
                السجلات الأجنبية
              </Button>
              <Button variant="outline" onClick={() => navigate("/")} className="border-white/30 text-white hover:bg-white/10">
                <Home className="w-4 h-4 ml-2" />
                الرئيسية
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-6 border-primary-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary-800">
              <Filter className="w-5 h-5" />
              البحث والتصفية - السيارات السورية
            </CardTitle>
            <CardDescription className="text-primary-600">ابحث وصفي بوليصات السيارات السورية حسب المعايير المختلفة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">البحث</label>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="اسم المالك، رقم البوليصة، رقم اللوحة، الرقم الوطني..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-3 pr-10 text-right"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">الحالة</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="active">ساري المفعول</SelectItem>
                    <SelectItem value="expired">منتهي الصلاحية</SelectItem>
                    <SelectItem value="cancelled">ملغي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">تاريخ الإنشاء</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع التواريخ</SelectItem>
                    <SelectItem value="today">اليوم</SelectItem>
                    <SelectItem value="week">آخر أسبوع</SelectItem>
                    <SelectItem value="month">آخر شهر</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">تصدير</label>
                <Button variant="outline" className="w-full flex items-center gap-2" disabled>
                  <Download className="w-4 h-4" />
                  تصدير Excel (لاحقاً)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mb-6">
          <Card className="bg-primary-50 border-primary-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-primary-800">إجراءات سريعة</h3>
                  <p className="text-primary-600">إضافة بوليصة جديدة أو إدارة السجلات</p>
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => navigate("/syrian-vehicles")} className="bg-primary hover:bg-primary-600">
                    <Plus className="w-4 h-4 ml-2" />
                    بوليصة سورية جديدة
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="border-primary-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي البوليصات السورية</p>
                  <p className="text-2xl font-bold text-primary">{stats.total}</p>
                </div>
                <Car className="w-8 h-8 text-primary-300" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">ساري المفعول</p>
                  <p className="text-2xl font-bold text-success">{stats.active}</p>
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
                  <p className="text-2xl font-bold text-destructive">{stats.expired}</p>
                </div>
                <Calendar className="w-8 h-8 text-destructive/50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي الأقساط</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(stats.totalPremium)}</p>
                </div>
                <FileText className="w-8 h-8 text-primary-300" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Records Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5 text-primary" />
              سجلات السيارات السورية ({filteredRecords.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">جارٍ تحميل السجلات...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-8">
                <Car className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">لا توجد سجلات سيارات سورية مطابقة للمعايير المحددة</p>
                <Button onClick={() => navigate("/syrian-vehicles")} className="mt-4 bg-primary hover:bg-primary-600">
                  إضافة بوليصة جديدة
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">رقم البوليصة</TableHead>
                      <TableHead className="text-right">المؤمن له</TableHead>
                      <TableHead className="text-right">الرقم الوطني</TableHead>
                      <TableHead className="text-right">المركبة</TableHead>
                      <TableHead className="text-right">رقم اللوحة</TableHead>
                      <TableHead className="text-right">نوع التغطية</TableHead>
                      <TableHead className="text-right">تاريخ البداية</TableHead>
                      <TableHead className="text-right">تاريخ الانتهاء</TableHead>
                      
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium text-primary">{record.policyNumber}</TableCell>
                        <TableCell>
                          <p className="font-medium">{record.ownerName}</p>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{record.nationalId}</TableCell>
                        <TableCell>
                          {record.brand} {record.model} {record.year}
                        </TableCell>
                        <TableCell className="font-mono font-bold">{record.plateNumber}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{getCoverageLabel(record.coverage)}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(record.startDate)}</TableCell>
                        <TableCell>{formatDate(record.endDate)}</TableCell>
                       
                        <TableCell>{getStatusBadge(record.status)}</TableCell>

                        {/* ✅ Actions */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {/* معاينة */}
                            <Button size="sm" variant="outline" onClick={() => handlePreview(record.id)} title="معاينة PDF">
                              <Eye className="w-4 h-4" />
                            </Button>

                            {/* تحميل */}
                            <Button size="sm" variant="outline" onClick={() => handleDownload(record.id)} title="تحميل PDF">
                              <Download className="w-4 h-4" />
                            </Button>

                            {/* تعديل */}
                            <Button size="sm" variant="outline" onClick={() => handleEdit(record.id)} title="تعديل البوليصة">
                              <Pencil className="w-4 h-4" />
                            </Button>

                            {/* حذف */}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openDeleteDialog(record)}
                              title="حذف البوليصة"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ✅ Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد أنك تريد حذف هذه البوليصة؟
              <br />
              <span className="font-bold">
                {deleteTarget ? `${deleteTarget.policyNumber} - ${deleteTarget.ownerName}` : ""}
              </span>
              <br />
              لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={isDeleting}>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جارٍ الحذف...
                </span>
              ) : (
                "نعم، احذف"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
