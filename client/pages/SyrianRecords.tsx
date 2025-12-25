import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Car, Search, Filter, Download, Eye, Calendar, User, FileText, Plus, Home, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

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

  useEffect(() => {
    // Load records from API
    const loadRecords = async () => {
      try {
        const { vehicleApi } = await import('../services/api');
        const response = await vehicleApi.getAll({ vehicleType: 'syrian' });
        
        if (response.success && response.data) {
          // Transform API data to match the component's interface
          const transformedRecords: SyrianPolicyRecord[] = response.data.map((vehicle: any) => ({
            id: vehicle._id || '',
            policyNumber: vehicle.policyNumber || 'N/A',
            ownerName: vehicle.ownerName,
            nationalId: vehicle.nationalId,
            plateNumber: vehicle.plateNumber,
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year?.toString() || '',
            coverage: vehicle.coverage || 'third-party',
            startDate: vehicle.createdAt ? new Date(vehicle.createdAt).toISOString().split('T')[0] : '',
            endDate: vehicle.createdAt ? new Date(new Date(vehicle.createdAt).setFullYear(new Date(vehicle.createdAt).getFullYear() + 1)).toISOString().split('T')[0] : '',
            premium: vehicle.insurance?.total ?? vehicle.insuranceTotal ?? vehicle.premium ?? 0,
 
            status: vehicle.status || 'active',
            createdAt: vehicle.createdAt || new Date().toISOString(),
            vehicleType: "syrian"
          }));
          
          setRecords(transformedRecords);
          setFilteredRecords(transformedRecords);
        }
      } catch (error) {
        console.error('Error loading records:', error);
        // Fall back to empty array on error
        setRecords([]);
        setFilteredRecords([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecords();
  }, []);

  // Keep mock data for reference (commented out)
  /*
      const mockRecords: SyrianPolicyRecord[] = [
        {
          id: "1",
          policyNumber: "SYR-2024-001",
          ownerName: "أحمد محمد علي",
          nationalId: "12345678901",
          plateNumber: "123456",
          brand: "تويوتا",
          model: "كورولا",
          year: "2020",
          coverage: "third-party",
          startDate: "2024-01-15",
          endDate: "2025-01-15",
          premium: 150000,
          status: "active",
          createdAt: "2024-01-15T10:30:00Z",
          vehicleType: "syrian"
        },
        {
          id: "2",
          policyNumber: "SYR-2024-002",
          ownerName: "محمد علي إبراهيم",
          nationalId: "12345678903",
          plateNumber: "345678",
          brand: "كيا",
          model: "سيراتو",
          year: "2021",
          coverage: "third-party",
          startDate: "2024-03-10",
          endDate: "2024-09-10",
          premium: 85000,
          status: "active",
          createdAt: "2024-03-10T09:20:00Z",
          vehicleType: "syrian"
        },
        {
          id: "3",
          policyNumber: "SYR-2024-003",
          ownerName: "عبد الله حسن محمود",
          nationalId: "12345678904",
          plateNumber: "789012",
          brand: "هيونداي",
          model: "إلنترا",
          year: "2019",
          coverage: "comprehensive",
          startDate: "2023-12-01",
          endDate: "2024-12-01",
          premium: 280000,
          status: "expired",
          createdAt: "2023-12-01T14:15:00Z",
          vehicleType: "syrian"
        },
        {
          id: "4",
          policyNumber: "SYR-2024-004",
          ownerName: "نادية أحمد خالد",
          nationalId: "12345678905",
          plateNumber: "456789",
          brand: "تويوتا",
          model: "يارس",
          year: "2022",
          coverage: "third-party",
          startDate: "2024-02-20",
          endDate: "2025-02-20",
          premium: 120000,
          status: "active",
          createdAt: "2024-02-20T11:45:00Z",
          vehicleType: "syrian"
        }
      ];
      */

  useEffect(() => {
    let filtered = records;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.ownerName.includes(searchTerm) ||
        record.policyNumber.includes(searchTerm) ||
        record.plateNumber.includes(searchTerm) ||
        record.nationalId.includes(searchTerm)
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    // Filter by date
    if (dateFilter !== "all") {
      const today = new Date();
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.createdAt);
        switch (dateFilter) {
          case "today":
            return recordDate.toDateString() === today.toDateString();
          case "week":
            const weekAgo = new Date();
            weekAgo.setDate(today.getDate() - 7);
            return recordDate >= weekAgo;
          case "month":
            const monthAgo = new Date();
            monthAgo.setMonth(today.getMonth() - 1);
            return recordDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    setFilteredRecords(filtered);
  }, [records, searchTerm, statusFilter, dateFilter]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "ساري المفعول", variant: "default" as const },
      expired: { label: "منتهي الصلاحية", variant: "destructive" as const },
      cancelled: { label: "ملغي", variant: "secondary" as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getCoverageLabel = (coverage: string) => {
    return coverage === "third-party" ? "تأمين ضد الغير" : "تأمين شامل";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SY', {
      style: 'currency',
      currency: 'SYP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SY');
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
              <Button variant="outline" onClick={() => navigate("/records")} className="border-white/30 text-white hover:bg-white/10">
                <FileText className="w-4 h-4 ml-2" />
                كل السجلات
              </Button>
              <Button variant="outline" onClick={() => navigate("/foreign-records")} className="border-white/30 text-white hover:bg-white/10">
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
            <CardDescription className="text-primary-600">
              ابحث وصفي بوليصات السيارات السورية حسب المعايير المختلفة
            </CardDescription>
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
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  تصدير Excel
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
                  <p className="text-2xl font-bold text-primary">{records.length}</p>
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
                  <p className="text-2xl font-bold text-success">
                    {records.filter(r => r.status === "active").length}
                  </p>
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
                  <p className="text-2xl font-bold text-destructive">
                    {records.filter(r => r.status === "expired").length}
                  </p>
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
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(records.reduce((sum, r) => sum + r.premium, 0))}
                  </p>
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
                <Button 
                  onClick={() => navigate("/syrian-vehicles")} 
                  className="mt-4 bg-primary hover:bg-primary-600"
                >
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
                      <TableHead className="text-right">القسط</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium text-primary">
                          {record.policyNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{record.ownerName}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {record.nationalId}
                        </TableCell>
                        <TableCell>
                          {record.brand} {record.model} {record.year}
                        </TableCell>
                        <TableCell className="font-mono font-bold">
                          {record.plateNumber}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getCoverageLabel(record.coverage)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(record.startDate)}</TableCell>
                        <TableCell>{formatDate(record.endDate)}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(record.premium)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(record.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/pdf?policy=${record.id}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/pdf?policy=${record.id}&download=true`)}
                            >
                              <Download className="w-4 h-4" />
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
    </div>
  );
}
