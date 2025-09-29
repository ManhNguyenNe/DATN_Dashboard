# 🚀 Hướng Dẫn Áp Dụng Bundle Optimization

## 📊 **Mục Tiêu Tối Ưu**

**Hiện tại:** 320 kB First Load JS  
**Mục tiêu:** 220 kB (-31% = ~100 kB)

**Ưu tiên theo tác động:**
1. **Lazy Load ApexCharts** → Giảm 40 kB (12.5%)
2. **Tree Shake Bootstrap** → Giảm 30 kB (9.4%)  
3. **Optimize Icons** → Giảm 20 kB (6.3%)
4. **Code Splitting Forms** → Giảm 10 kB (3.1%)

---

## 🔥 **Phase 1: Quick Wins (30 phút)**

### **1. Lazy Load ApexCharts (-40 kB)**

**Trước:**
```typescript
// components/dashboard/DashboardStats.tsx
import ApexChart from 'react-apexcharts'; // Tải ngay lập tức

const DashboardStats = () => {
  return <ApexChart options={chartOptions} series={series} />;
};
```

**Sau:**
```typescript
// Import lazy component
import { LazyChart } from '@/components/common/LazyComponents';

const DashboardStats = () => {
  const [showChart, setShowChart] = useState(false);
  
  // Chỉ load chart khi cần
  useEffect(() => {
    const timer = setTimeout(() => setShowChart(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div>
      {showChart ? (
        <LazyChart options={chartOptions} series={series} />
      ) : (
        <div className="chart-skeleton">Loading chart...</div>
      )}
    </div>
  );
};
```

### **2. Optimize Bootstrap CSS (-30 kB)**

**Trước:**
```typescript
// app/layout.tsx
import 'bootstrap/dist/css/bootstrap.min.css'; // 200 kB
```

**Sau:**
```typescript
// app/layout.tsx  
import '@/styles/bootstrap-optimized.scss'; // ~80 kB

// Hoặc trong component cụ thể
import { Button, Modal, Card } from '@/utils/optimizedImports';
```

### **3. Tree Shake Icons (-20 kB)**

**Trước:**
```typescript
import * as TablerIcons from '@tabler/icons-react'; // Toàn bộ pack

const Header = () => (
  <TablerIcons.IconHome size={24} />
);
```

**Sau:**
```typescript
import { IconHome } from '@/utils/optimizedImports'; // Chỉ icon cần thiết

const Header = () => (
  <IconHome size={24} />
);
```

---

## 🔥 **Phase 2: Advanced Optimization (45 phút)**

### **4. Dynamic Route-based Loading**

**File:** `app/(dashboard)/le-tan/dat-lich/page.tsx` (11 kB → 3 kB)

```typescript
import { lazy, Suspense } from 'react';
import { TableSkeleton } from '@/components/common/SkeletonLoaders';

// Lazy load heavy form
const HeavyAppointmentForm = lazy(() => 
  import('./HeavyAppointmentForm')
);

const AppointmentPage = () => {
  const [showForm, setShowForm] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShowForm(true)}>
        Đặt lịch khám
      </button>
      
      {showForm && (
        <Suspense fallback={<TableSkeleton rows={6} />}>
          <HeavyAppointmentForm />
        </Suspense>
      )}
    </div>
  );
};
```

### **5. Preload Strategy**

```typescript
// app/layout.tsx
import { preloadCriticalComponents } from '@/utils/optimizedImports';

const RootLayout = ({ children }) => {
  useEffect(() => {
    // Preload khi user idle
    preloadCriticalComponents();
  }, []);
  
  return (
    <html>
      <body>{children}</body>
    </html>
  );
};
```

---

## 🔥 **Phase 3: Bundle Analysis & Monitoring**

### **6. Continuous Monitoring**

```bash
# Chạy bundle analysis
npm run analyze

# So sánh kết quả
echo "Before optimization: 320 kB"
echo "After Phase 1: $(cat .next/trace | grep 'First Load JS')"
echo "Target: 220 kB"
```

### **7. Performance Tracking**

```typescript
// utils/performanceMonitor.ts
export const trackBundleReduction = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const entries = performance.getEntriesByType('navigation');
    const [navigation] = entries as PerformanceNavigationTiming[];
    
    console.log(`Page Load Time: ${navigation.loadEventEnd - navigation.fetchStart}ms`);
    console.log(`First Paint: ${performance.getEntriesByName('first-paint')[0]?.startTime}ms`);
  }
};
```

---

## 📋 **Checklist Thực Hiện**

### **Phase 1 (Quick Wins):**
- [ ] **Lazy load ApexCharts** trong dashboard components
- [ ] **Thay thế Bootstrap CSS** bằng optimized version  
- [ ] **Tree shake icon imports** trong tất cả components
- [ ] **Test build** với `npm run analyze`

### **Phase 2 (Advanced):**
- [ ] **Lazy load heavy forms** trong `/le-tan/dat-lich`
- [ ] **Implement preloading** strategy
- [ ] **Add performance monitoring**
- [ ] **Test trên mobile** với slow 3G

### **Phase 3 (Monitoring):**
- [ ] **Setup bundle size alerts** trong CI/CD
- [ ] **Monitor Core Web Vitals**
- [ ] **A/B test** performance impact

---

## 🎯 **Kết Quả Dự Kiến Sau Mỗi Phase**

### **Phase 1:**
```
Bundle Size: 320 kB → 250 kB (-22%)
LCP: 3.2s → 2.5s (-22%)  
FCP: 1.8s → 1.4s (-22%)
```

### **Phase 2:**
```
Bundle Size: 250 kB → 220 kB (-12%)
LCP: 2.5s → 2.1s (-16%)
TTI: 4.1s → 3.2s (-22%)
```

### **Phase 3:**
```
Monitoring: Real-time alerts
Mobile Score: +15-20 points
User Experience: Đáng kể cải thiện
```

---

## 🚨 **Lưu Ý Quan Trọng**

1. **Test từng phase:** Đảm bảo không breaking changes
2. **Mobile first:** Ưu tiên mobile performance  
3. **User experience:** Skeleton loaders quan trọng
4. **Monitoring:** Theo dõi real user metrics

**Bắt đầu với Phase 1 - chỉ 30 phút để giảm 70 kB bundle size!** 🚀