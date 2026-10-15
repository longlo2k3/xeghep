import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Globe,
  FileText,
  MapPin,
  FileCheck,
  RefreshCw,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/admin/components/ui/Button';
import { Select } from '@/admin/components/ui/Select';
import { Badge } from '@/admin/components/ui/Badge';
import { Card, CardContent } from '@/admin/components/ui/Card';
import { DataTable, type Column } from '@/admin/components/common/DataTable';
import { apiClient, getApiErrorMessage } from '@/admin/lib/api-client';
import { formatDateTime } from '@/admin/lib/utils';
import type { SitemapEntry, SitemapType } from '@/admin/types/seo';

const MOCK_SITEMAP_ENTRIES: SitemapEntry[] = [
  { path: '/', lastmod: new Date().toISOString(), type: 'page' },
  { path: '/gioi-thieu', lastmod: new Date().toISOString(), type: 'page' },
  { path: '/chinh-sach-bao-mat', lastmod: new Date().toISOString(), type: 'page' },
  { path: '/dieu-khoan-su-dung', lastmod: new Date().toISOString(), type: 'page' },
  { path: '/tuyen-ha-noi-thai-nguyen', lastmod: new Date().toISOString(), type: 'route' },
  { path: '/tuyen-ha-noi-bac-kan', lastmod: new Date().toISOString(), type: 'route' },
  { path: '/tuyen-ha-noi-cao-bang', lastmod: new Date().toISOString(), type: 'route' },
  { path: '/tuyen-ha-noi-lang-son', lastmod: new Date().toISOString(), type: 'route' },
  { path: '/tin-tuc/kinh-nghiem-dat-xe-ghep-an-toan', lastmod: new Date().toISOString(), type: 'article' },
  { path: '/tin-tuc/huong-dan-di-san-bay-noi-bai-tiet-kiem', lastmod: new Date().toISOString(), type: 'article' },
];

export function SitemapMonitor() {
  const [entries, setEntries] = useState<SitemapEntry[]>(MOCK_SITEMAP_ENTRIES);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const fetchSitemap = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiClient.get<any>('/v1/seo/sitemap');
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      if (list.length > 0) {
        setEntries(list);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSitemap();
  }, [fetchSitemap]);

  // Thống kê theo loại
  const stats = useMemo(() => {
    const total = entries.length;
    const pagesCount = entries.filter((e) => e.type === 'page').length;
    const routesCount = entries.filter((e) => e.type === 'route').length;
    const articlesCount = entries.filter((e) => e.type === 'article').length;
    return { total, pagesCount, routesCount, articlesCount };
  }, [entries]);

  // Lọc dữ liệu
  const filteredEntries = useMemo(() => {
    return entries.filter((item) => {
      const matchType = selectedType === 'all' || item.type === selectedType;
      const matchSearch =
        !searchQuery.trim() || item.path.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchSearch;
    });
  }, [entries, selectedType, searchQuery]);

  const getTypeBadge = (type: SitemapType) => {
    switch (type) {
      case 'page':
        return (
          <Badge variant="info" className="bg-blue-50 text-blue-700 border border-blue-200">
            Trang (Page)
          </Badge>
        );
      case 'route':
        return (
          <Badge
            variant="success"
            className="bg-emerald-50 text-emerald-700 border border-emerald-200"
          >
            Tuyến xe (Route)
          </Badge>
        );
      case 'article':
        return (
          <Badge
            variant="warning"
            className="bg-purple-50 text-purple-700 border border-purple-200"
          >
            Bài viết (Article)
          </Badge>
        );
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const columns: Column<SitemapEntry>[] = [
    {
      key: 'path',
      header: 'Đường dẫn (Path URL)',
      render: (item) => (
        <div className="flex items-center gap-2 font-mono text-sm text-slate-800">
          <span>{item.path}</span>
          <a
            href={item.path}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-blue-600 transition"
            title="Mở URL"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Loại nội dung',
      render: (item) => getTypeBadge(item.type),
    },
    {
      key: 'lastmod',
      header: 'Cập nhật lần cuối (lastmod)',
      render: (item) => (
        <span className="text-xs text-slate-500 font-mono">
          {formatDateTime(item.lastmod) || item.lastmod}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Alert lỗi nếu có */}
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Thống kê Sitemap Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Tổng URL Index</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
              </div>
              <Globe className="w-7 h-7 text-blue-600 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Trang Tĩnh & CMS</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.pagesCount}</p>
              </div>
              <FileText className="w-7 h-7 text-blue-600 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Tuyến đường</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.routesCount}</p>
              </div>
              <MapPin className="w-7 h-7 text-emerald-600 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Bài viết Tin tức</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{stats.articlesCount}</p>
              </div>
              <FileCheck className="w-7 h-7 text-purple-600 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Select
            options={[
              { label: 'Tất cả loại URL', value: 'all' },
              { label: 'Trang nội dung (page)', value: 'page' },
              { label: 'Tuyến đường (route)', value: 'route' },
              { label: 'Bài viết tin tức (article)', value: 'article' },
            ]}
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-52"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchSitemap}
            isLoading={isLoading}
            className="gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Làm mới Sitemap
          </Button>
        </div>
      </div>

      {/* Danh sách URL trong sitemap */}
      <DataTable
        data={filteredEntries}
        columns={columns}
        rowKey={(item) => item.path}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Tìm theo đường dẫn (URL path)..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        pagination
        pageSize={15}
        emptyTitle="Không có URL nào trong sitemap"
        emptyMessage="Tất cả trang đều được loại trừ hoặc chưa xuất bản."
      />
    </div>
  );
}

export default SitemapMonitor;
