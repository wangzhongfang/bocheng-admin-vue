<template>
  <div class="category-sidebar">
    <!-- 搜索框 -->
    <el-input
      v-model="searchQuery"
      placeholder="请输入关键字搜索分类"
      size="small"
      clearable
      class="mb-2"
      @keyup.enter="handleSearch"
    >
      <template #prefix>
        <Icon icon="ep:search" />
      </template>
    </el-input>

    <!-- 分类列表 -->
    <el-scrollbar max-height="calc(100vh - 120px)">
      <el-menu
        :default-active="activeKey"
        mode="vertical"
        background-color="transparent"
        text-color="#606266"
        active-text-color="#409EFF"
        :collapse="false"
        @select="handleCategorySelect"
      >
        <el-menu-item
          v-for="item in filteredCategories"
          :key="item.value"
          :index="item.value"
          :class="{ 'is-active': item.value === activeKey }"
        >
          <span>{{ item.label }} ({{ item.num || 0 }})</span>
        </el-menu-item>
        <el-empty v-if="loading && filteredCategories.length === 0" description="加载中..." />
        <el-empty
          v-else-if="!loading && filteredCategories.length === 0"
          description="暂无分类数据"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { MaterialApi } from '@/api/prj/material'

interface CategoryItem {
  value: string
  label: string
  num?: number
}

const searchQuery = ref('')
const activeKey = ref<string | undefined>()
const categories = ref<CategoryItem[]>([])
const loading = ref(true)

// 过滤后的分类列表
const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories.value
  const q = searchQuery.value.toLowerCase()
  return categories.value.filter((item) => item.label.toLowerCase().includes(q))
})

// 初始化：从接口获取分类数据
onMounted(async () => {
  try {
    loading.value = true
    // ✅ 关键：自行调用接口，不依赖父级传参
    const res = await MaterialApi.getCategoryListWithMaterialCount({})
    categories.value = [
      { value: '', label: '全部分类', num: res.reduce((sum, item) => sum + item.num, 0) }, // 插入“全部”选项
      ...res.map((item: any) => ({
        value: item.id,
        label: item.categoryName,
        num: item.num
      }))
    ]
  } catch (error) {
    console.error('获取分类失败:', error)
  } finally {
    loading.value = false
  }
})

// 搜索触发（可选）
const handleSearch = () => {
  // 已由 computed 自动响应
}

const emit = defineEmits(['node-click']) // 定义事件发射器
// 点击分类项时触发事件
const handleCategorySelect = (index: string) => {
  const selectedCategory = filteredCategories.value.find((item) => item.value === index)
  if (selectedCategory) {
    emit('node-click', selectedCategory) // 发送点击的分类数据给父组件
  }
}
</script>

<style scoped></style>
