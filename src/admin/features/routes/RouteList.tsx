import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  RefreshCw,
  Star,
  Eye,
} from "lucide-react";
import { Button } from "@/admin/components/ui/Button";
import { Select } from "@/admin/components/ui/Select";
import { Badge } from "@/admin/components/ui/Badge";
import { DataTable, type Column } from "@/admin/components/common/DataTable";
import { StatusBadge } from "@/admin/components/common/StatusBadge";
import { ConfirmDialog } from "@/admin/components/common/ConfirmDialog";
import { apiClient, getApiErrorMessage } from "@/admin/lib/api-client";
import { formatVND } from "@/admin/lib/utils";
import type { RouteDoc, RouteRegion } from "@/admin/types/routes";
import type { PaginatedResponse } from "@/admin/types/api";

const REGION_OPTIONS: { label: string; value: string }[] = [
  { label: "Tất cả khu vực", value: "all" },
  { label: "Hải Phòng", value: "Hải Phòng" },
  { label: "Hà Nội", value: "Hà Nội" },
  { label: "Hạ Long", value: "Hạ Long" },
  { label: "Móng Cái", value: "Móng Cái" },
  { label: "Bắc Ninh – Bắc Giang", value: "Bắc Ninh – Bắc Giang" },
];

const STATUS_OPTIONS = [
  { label: "Tất cả trạng thái", value: "all" },
  { label: "Đang hoạt động (Active)", value: "active" },
  { label: "Bản nháp (Draft)", value: "draft" },
  { label: "Lưu trữ (Archived)", value: "archived" },
  { label: "Tạm dừng (Inactive)", value: "inactive" },
];

export function RouteList() {
  const navigate = useNavigate();

  const [routes, setRoutes] = useState<RouteDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bộ lọc
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Xóa tuyến
  const [routeToDelete, setRouteToDelete] = useState<RouteDoc | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRoutes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiClient.get<PaginatedResponse<RouteDoc> | RouteDoc[]>(
        "/routes",
        {
          params: {
            limit: 100,
            sort: "sortOrder",
          },
        },
      );

      const data = res.data;
      if (Array.isArray(data)) {
        setRoutes(data);
      } else if (data && Array.isArray(data.docs)) {
        setRoutes(data.docs);
      } else {
        setRoutes([]);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const handleDelete = async () => {
    if (!routeToDelete) return;

    try {
      setIsDeleting(true);
      await apiClient.delete(`/routes/${routeToDelete.id}`);
      setRoutes((prev) => prev.filter((r) => r.id !== routeToDelete.id));
      setRouteToDelete(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  // Lọc dữ liệu theo bộ lọc trạng thái, khu vực và ô tìm kiếm
  const filteredRoutes = useMemo(() => {
    return routes.filter((item) => {
      // Lọc trạng thái
      if (selectedStatus !== "all" && item.status !== selectedStatus) {
        return false;
      }

      // Lọc vùng miền
      if (selectedRegion !== "all") {
        const itemRegions = item.regions || [];
        const matchesRegion =
          itemRegions.includes(selectedRegion as RouteRegion) ||
          item.origin?.toLowerCase().includes(selectedRegion.toLowerCase()) ||
          item.destination
            ?.toLowerCase()
            .includes(selectedRegion.toLowerCase());
        if (!matchesRegion) return false;
      }

      // Tìm kiếm (tên, điểm đi, điểm đến, slug)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name?.toLowerCase().includes(q);
        const matchesOrigin = item.origin?.toLowerCase().includes(q);
        const matchesDestination = item.destination?.toLowerCase().includes(q);
        const matchesSlug = item.slug?.toLowerCase().includes(q);
        if (
          !matchesName &&
          !matchesOrigin &&
          !matchesDestination &&
          !matchesSlug
        ) {
          return false;
        }
      }

      return true;
    });
  }, [routes, selectedStatus, selectedRegion, searchQuery]);

  // Thống kê nhanh
  const stats = useMemo(() => {
    const total = routes.length;
    const active = routes.filter((r) => r.status === "active").length;
    const draft = routes.filter((r) => r.status === "draft").length;
    const bannerTop = routes.filter((r) => r.isBannerTop).length;
    return { total, active, draft, bannerTop };
  }, [routes]);

  // Cấu hình các cột cho DataTable: Tinh gọn các thông tin cốt lõi nhất
  const columns: Column<RouteDoc>[] = [
    {
      key: "name",
      header: "Tuyến đường & Lộ trình",
      sortable: true,
      render: (item) => (
        <div className="max-w-xs md:max-w-sm space-y-1">
          <Link
            to={`/routes/${item.id}`}
            className="font-semibold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1 block"
            data-testid={`route-title-${item.id}`}
          >
            {item.name}
          </Link>
        </div>
      ),
    },
    {
      key: "priceFrom",
      header: "Giá từ",
      sortable: true,
      render: (item) => (
        <div className="text-xs space-y-0.5">
          <span className="font-bold text-emerald-600 font-mono text-sm block">
            {item.priceFrom ? formatVND(item.priceFrom) : "—"}
          </span>
          <span className="text-[11px] text-slate-400">4 hạng vé cước</span>
        </div>
      ),
    },
    {
      key: "isBannerTop",
      header: "Banner Top",
      align: "center",
      render: (item) => {
        if (!item.isBannerTop) {
          return <span className="text-slate-400 text-xs">—</span>;
        }
        return (
          <Badge
            variant="warning"
            size="sm"
            className="bg-amber-500/15 text-amber-700 border border-amber-500/30 font-medium"
            data-testid={`banner-top-badge-${item.id}`}
          >
            <Star className="w-3 h-3 mr-1 fill-amber-400 text-amber-500 shrink-0" />
            <span>{item.bannerLabel || "Top"}</span>
          </Badge>
        );
      },
    },
    {
      key: "description",
      header: "Thông tin thêm",
      render: (item) => (
        <div className="max-w-xs md:max-w-sm">
          {item.description && (
            <div className="text-xs text-slate-600 line-clamp-2">
              {item.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      align: "center",
      render: (item) => <StatusBadge type="route" status={item.status} />,
    },
    {
      key: "actions",
      header: "Thao tác",
      align: "right",
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/routes/${item.id}?mode=view`)}
            title="Xem chi tiết đầy đủ tuyến"
            data-testid={`view-route-${item.id}`}
            className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 p-1.5 h-auto cursor-pointer rounded-lg"
          >
            <Eye className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/routes/${item.id}`)}
            title="Chỉnh sửa tuyến đường"
            data-testid={`edit-route-${item.id}`}
            className="text-slate-500 hover:text-amber-600 hover:bg-amber-50 p-1.5 h-auto cursor-pointer rounded-lg"
          >
            <Edit className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRouteToDelete(item)}
            title="Xóa tuyến đường"
            data-testid={`delete-route-${item.id}`}
            className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 p-1.5 h-auto cursor-pointer rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6" data-testid="route-list-page">
      {/* Tiêu đề & Nút thêm tuyến */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Quản lý Tuyến đường & Bảng giá cước
            </h1>
            <Badge variant="default" size="sm">
              {stats.total} tuyến
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Quản trị danh mục tuyến liên tỉnh, cấu hình 4 hạng vé cước, điểm đón
            trả và thông tin SEO.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRoutes}
            disabled={isLoading}
            className="cursor-pointer"
            title="Tải lại danh sách"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => navigate("/routes/new")}
            data-testid="add-route-btn"
            className="cursor-pointer shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Thêm tuyến mới</span>
          </Button>
        </div>
      </div>

      {/* Thông báo lỗi nếu có */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-xs underline text-rose-600 hover:text-rose-700 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Thẻ thống kê tóm tắt */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-3.5">
          <span className="text-xs text-slate-500 font-medium">
            Tổng số tuyến
          </span>
          <div className="text-xl font-bold text-slate-900 mt-0.5">
            {stats.total}
          </div>
        </div>
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-3.5">
          <span className="text-xs text-emerald-600 font-medium">
            Đang hoạt động
          </span>
          <div className="text-xl font-bold text-emerald-600 mt-0.5">
            {stats.active}
          </div>
        </div>
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-3.5">
          <span className="text-xs text-amber-600 font-medium">
            Bản nháp / Lưu trữ
          </span>
          <div className="text-xl font-bold text-amber-600 mt-0.5">
            {stats.draft}
          </div>
        </div>
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-3.5">
          <span className="text-xs text-blue-600 font-medium">
            Hiện Banner Top
          </span>
          <div className="text-xl font-bold text-blue-600 mt-0.5">
            {stats.bannerTop}
          </div>
        </div>
      </div>

      {/* Bảng dữ liệu Tuyến đường với Search và Bộ lọc */}
      <DataTable
        data={filteredRoutes}
        columns={columns}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Tìm theo tên tuyến, điểm đi, điểm đến, slug..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterSlot={
          <div className="flex flex-wrap items-center gap-2">
            {/* Bộ lọc Vùng miền */}
            <div className="w-48">
              <Select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                options={REGION_OPTIONS}
                data-testid="region-filter"
              />
            </div>

            {/* Bộ lọc Trạng thái */}
            <div className="w-48">
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                options={STATUS_OPTIONS}
                data-testid="status-filter"
              />
            </div>
          </div>
        }
        emptyTitle="Chưa có tuyến đường nào"
        emptyMessage="Không tìm thấy tuyến đường nào phù hợp với bộ lọc hiện tại hoặc chưa có dữ liệu."
      />

      {/* Hộp thoại xác nhận xóa tuyến đường */}
      <ConfirmDialog
        isOpen={Boolean(routeToDelete)}
        title="Xóa tuyến đường"
        description={
          routeToDelete
            ? `Bạn có chắc chắn muốn xóa tuyến "${routeToDelete.name}" (${routeToDelete.slug})? Thao tác này không thể hoàn tác.`
            : ""
        }
        confirmText="Xác nhận xóa"
        cancelText="Hủy bỏ"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setRouteToDelete(null)}
      />


    </div>
  );
}

export default RouteList;
