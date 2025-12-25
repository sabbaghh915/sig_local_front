import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Globe, Search, Filter, Download, Eye, Calendar, User, FileText, Plus, Home, Car, MapPin } from "lucide-react";
import { cn } from "../lib/utils";

interface ForeignPolicyRecord {
  id: string;
  policyNumber: string;
  ownerName: string;
  nationality: string;
  passportNumber: string;
  plateNumber: string;
  plateCountry: string;
  brand: string;
  model: string;
  year: string;
  coverage: string;
  startDate: string;
  endDate: string;
  entryDate: string;
  exitDate: string;
  entryPoint: string;
  premium: number;
  status: "active" | "expired" | "cancelled";
  createdAt: string;
  vehicleType: "foreign";
}

export default function ForeignRecords() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<ForeignPolicyRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<ForeignPolicyRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [nationalityFilter, setNationalityFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load records from API
    const loadRecords = async () => {
      try {
        const { vehicleApi } = await import('../services/api');
        const response = await vehicleApi.getAll({ vehicleType: 'foreign' });
        
        if (response.success && response.data) {
          // Transform API data to match the component's interface
          const transformedRecords: ForeignPolicyRecord[] = response.data.map((vehicle: any) => ({
            id: vehicle._id || '',
            policyNumber: vehicle.policyNumber || 'N/A',
            ownerName: vehicle.ownerName,
            nationality: vehicle.nationality || 'غير محدد',
            passportNumber: vehicle.passportNumber || vehicle.nationalId,
            plateNumber: vehicle.plateNumber,
            plateCountry: vehicle.nationality || 'غير محدد',
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year?.toString() || '',
            coverage: vehicle.coverage || 'border-insurance',
            startDate: vehicle.createdAt ? new Date(vehicle.createdAt).toISOString().split('T')[0] : '',
            endDate: vehicle.exitDate ? new Date(vehicle.exitDate).toISOString().split('T')[0] : '',
            entryDate: vehicle.entryDate ? new Date(vehicle.entryDate).toISOString().split('T')[0] : '',
            exitDate: vehicle.exitDate ? new Date(vehicle.exitDate).toISOString().split('T')[0] : '',
            entryPoint: vehicle.customsDocument || 'غير محدد',
            premium: 75000,
            status: vehicle.status || 'active',
            createdAt: vehicle.createdAt || new Date().toISOString(),
            vehicleType: "foreign"
          }));
          
          setRecords(transformedRecords);
          setFilteredRecords(transformedRecords);
        }
      } catch (error) {
        console.error('Error loading records:', error);
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
      const mockRecords: ForeignPolicyRecord[] = [
        {
          id: "1",
          policyNumber: "FOR-2024-001",
          ownerName: "Ahmad Khalil",
          nationality: "لبنانية",
          passportNumber: "LB1234567",
          plateNumber: "ABC123",
          plateCountry: "لبنان",
          brand: "تويوتا",
          model: "كامري",
          year: "2021",
          coverage: "border-insurance",
          startDate: "2024-01-20",
          endDate: "2024-02-20",
          entryDate: "2024-01-20",
          exitDate: "2024-02-20",
          entryPoint: "معبر العريضة",
          premium: 75000,
          status: "active",
          createdAt: "2024-01-20T08:30:00Z",
          vehicleType: "foreign"
        },
        {
          id: "2", 
          policyNumber: "FOR-2024-002",
          ownerName: "Sarah Ahmed",
          nationality: "أردنية",
          passportNumber: "JO7654321",
          plateNumber: "XYZ456",
          plateCountry: "الأردن",
          brand: "هيونداي",
          model: "سانتافي",
          year: "2020",
          coverage: "third-party",
          startDate: "2024-02-10",
          endDate: "2024-05-10",
          entryDate: "2024-02-10",
          exitDate: "2024-05-10",
          entryPoint: "معبر نصيب الحدودي",
          premium: 180000,
          status: "active",
          createdAt: "2024-02-10T14:20:00Z",
          vehicleType: "foreign"
        },
        {
          id: "3",
          policyNumber: "FOR-2024-003", 
          ownerName: "Mehmet Özkan",
          nationality: "تركية",
          passportNumber: "TR9876543",
          plateNumber: "34ABC789",
          plateCountry: "تركيا",
          brand: "رينو",
          model: "ميغان",
          year: "2019",
          coverage: "comprehensive",
          startDate: "2023-12-15",
          endDate: "2024-01-15",
          entryDate: "2023-12-15",
          exitDate: "2024-01-15",
          entryPoint: "معبر باب الهوى",
          premium: 120000,
          status: "expired",
          createdAt: "2023-12-15T10:15:00Z",
          vehicleType: "foreign"
        },
        {
          id: "4",
          policyNumber: "FOR-2024-004",
          ownerName: "Omar Al-Rashid",
          nationality: "عراقية",
          passportNumber: "IQ5432167",
          plateNumber: "BGD999",
          plateCountry: "العراق",
          brand: "تويوتا",
          model: "لاندكروزر",
          year: "2022",
          coverage: "third-party",
          startDate: "2024-03-01",
          endDate: "2024-06-01",
          entryDate: "2024-03-01",
          exitDate: "2024-06-01",
          entryPoint: "معبر البوكمال",
          premium: 200000,
          status: "active",
          createdAt: "2024-03-01T16:45:00Z",
          vehicleType: "foreign"
        }
      ];
      */

  useEffect(() => {
    let filtered = records;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.policyNumber.includes(searchTerm) ||
        record.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.passportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.plateCountry.includes(searchTerm)
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    // Filter by nationality
    if (nationalityFilter !== "all") {
      filtered = filtered.filter(record => record.nationality === nationalityFilter);
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
  }, [records, searchTerm, statusFilter, nationalityFilter, dateFilter]);

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
    switch (coverage) {
      case "third-party": return "تأمين ضد الغير";
      case "comprehensive": return "تأمين شامل";
      case "border-insurance": return "تأمين حدود";
      default: return coverage;
    }
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

  const getNationalityBadge = (nationality: string) => {
    const colors = {
      "لبنانية": "bg-green-100 text-green-800",
      "أردنية": "bg-blue-100 text-blue-800", 
      "تركية": "bg-red-100 text-red-800",
      "عراقية": "bg-yellow-100 text-yellow-800",
      "فلسطينية": "bg-purple-100 text-purple-800",
      "مصرية": "bg-indigo-100 text-indigo-800"
    };
    
    return (
      <Badge className={colors[nationality as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {nationality}
      </Badge>
    );
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
                <h1 className="text-xl font-bold text-white">سجلات السيارات الأجنبية</h1>
                <p className="text-sm text-white/90">تأمين المركبات الأجنبية والعابرة</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => navigate("/records")} className="border-white/30 text-white hover:bg-white/10">
                <FileText className="w-4 h-4 ml-2" />
                كل السجلات
              </Button>
              <Button variant="outline" onClick={() => navigate("/syrian-records")} className="border-white/30 text-white hover:bg-white/10">
                <Car className="w-4 h-4 ml-2" />
                السجلات السورية
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
        <Card className="mb-6 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <Filter className="w-5 h-5" />
              البحث والتصفية - السيارات الأجنبية
            </CardTitle>
            <CardDescription className="text-red-600">
              ابحث وصفي بوليصات السيارات الأجنبية حسب الجنسية والدولة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">البحث</label>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="اسم المالك، رقم البوليصة، رقم اللوحة، جواز السفر..."
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
                <label className="text-sm font-medium">الجنسية</label>
                <Select value={nationalityFilter} onValueChange={setNationalityFilter}>
                  <SelectTrigger className="text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الجنسيات</SelectItem>
                    <SelectItem value="لبنانية">لبنانية</SelectItem>
                    <SelectItem value="أردنية">أردنية</SelectItem>
                    <SelectItem value="تركية">تركية</SelectItem>
                    <SelectItem value="عراقية">عراقية</SelectItem>
                    <SelectItem value="فلسطينية">فلسطينية</SelectItem>
                    <SelectItem value="مصرية">مصرية</SelectItem>
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
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-red-800">إجراءات سريعة</h3>
                  <p className="text-red-600">إضافة بوليصة جديدة للمركبات الأجنبية</p>
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => navigate("/foreign-vehicles")} className="bg-syrian-red hover:bg-red-600">
                    <Plus className="w-4 h-4 ml-2" />
                    بوليصة أجنبية جديدة
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي البوليصات الأجنبية</p>
                  <p className="text-2xl font-bold text-syrian-red">{records.length}</p>
                </div>
                <Globe className="w-8 h-8 text-red-300" />
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
                  <p className="text-2xl font-bold text-syrian-red">
                    {formatCurrency(records.reduce((sum, r) => sum + r.premium, 0))}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-red-300" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Records Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-syrian-red" />
              سجلات السيارات الأجنبية ({filteredRecords.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-syrian-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">جارٍ تحميل السجلات...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-8">
                <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">لا توجد سجلات سيارات أجنبية مطابقة للمعايير المحددة</p>
                <Button 
                  onClick={() => navigate("/foreign-vehicles")} 
                  className="mt-4 bg-syrian-red hover:bg-red-600"
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
                      <TableHead className="text-right">الجنسية</TableHead>
                      <TableHead className="text-right">جواز السفر</TableHead>
                      <TableHead className="text-right">المركبة</TableHead>
                      <TableHead className="text-right">رقم اللوحة</TableHead>
                      <TableHead className="text-right">دولة التسجيل</TableHead>
                      <TableHead className="text-right">نقطة الدخول</TableHead>
                      <TableHead className="text-right">فترة الإقامة</TableHead>
                      <TableHead className="text-right">نوع التغطية</TableHead>
                      <TableHead className="text-right">القسط</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium text-syrian-red">
                          {record.policyNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{record.ownerName}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getNationalityBadge(record.nationality)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {record.passportNumber}
                        </TableCell>
                        <TableCell>
                          {record.brand} {record.model} {record.year}
                        </TableCell>
                        <TableCell className="font-mono font-bold">
                          {record.plateNumber}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {record.plateCountry}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {record.entryPoint}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div>
                            <div>من: {formatDate(record.entryDate)}</div>
                            <div>إلى: {formatDate(record.exitDate)}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getCoverageLabel(record.coverage)}
                          </Badge>
                        </TableCell>
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
