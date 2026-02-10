<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    width="70%"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <el-row :gutter="20">
      <!-- 左侧分类树 -->
      <el-col :span="4" :xs="24">
        <ContentWrap class="h-1/1">
          <CategoryTree @node-click="handleCategoryNodeClick" />
        </ContentWrap>
      </el-col>
      <el-col :span="20" :xs="24">
        <!-- 搜索 -->
        <ContentWrap>
          <el-form
            class="-mb-15px"
            :model="queryParams"
            ref="queryFormRef"
            :inline="true"
            label-width="68px"
          >
            <el-form-item label="材料名称" prop="materialName">
              <el-input
                v-model="queryParams.materialName"
                placeholder="请输入材料名称"
                clearable
                @keyup.enter="handleQuery"
                class="!w-240px"
              />
            </el-form-item>
            <el-form-item label="规格型号" prop="spec">
              <el-input
                v-model="queryParams.spec"
                placeholder="请输入规格型号"
                clearable
                @keyup.enter="handleQuery"
                class="!w-240px"
              />
            </el-form-item>
            <el-form-item label="品牌" prop="brand">
              <el-input
                v-model="queryParams.brand"
                placeholder="请输入品牌"
                clearable
                @keyup.enter="handleQuery"
                class="!w-240px"
              />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select
                v-model="queryParams.status"
                class="!w-240px"
                clearable
                placeholder="请选择封存状态"
                filterable
              >
                <el-option
                  v-for="dict in getIntDictOptions(DICT_TYPE.PRJ_SEAL_STATUS)"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button @click="handleQuery"><Icon icon="ep:search" />搜索</el-button>
              <el-button @click="resetQuery"><Icon icon="ep:refresh" />重置</el-button>
              <el-button
                type="primary"
                plain
                @click="openForm('create')"
                v-hasPermi="['system:user:create']"
              >
                <Icon icon="ep:plus" /> 新增
              </el-button>
            </el-form-item>
          </el-form>
        </ContentWrap>
        <ContentWrap>
          <el-table
            ref="tableRef"
            v-loading="loading"
            :data="list"
            @selection-change="handleRowCheckboxChange"
            :row-key="(row) => row.id"
          >
            <el-table-column
              v-if="props.multiple"
              type="selection"
              width="55"
              :reserve-selection="true"
            />
            <el-table-column label="材料名称" align="center" prop="materialName" />
            <el-table-column label="规格型号" align="center" prop="spec">
              <template #default="scope">
                <span>{{ scope.row.spec || '--' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="品牌" align="center" prop="brand">
              <template #default="scope">
                <span>{{ scope.row.brand || '--' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="分类名称" align="center" prop="categoryId">
              <template #default="scope">
                <span>{{ getCategoryName(scope.row.categoryId) || '--' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="库存" align="center" prop="brand">
              <span>{{ '--' }}</span>
            </el-table-column>
            <el-table-column label="计划数量" align="center" prop="brand">
              <span>{{ '--' }}</span>
            </el-table-column>
            <el-table-column label="计量单位" align="center" prop="unit" />
            <el-table-column label="其他属性" align="center" prop="otherProperties">
              <template #default="scope">
                <span>{{ scope.row.otherProperties || '--' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" align="center" prop="status">
              <template #default="scope">
                <el-switch
                  v-model="scope.row.status"
                  :active-value="1"
                  :inactive-value="0"
                  disabled
                />
              </template>
            </el-table-column>
          </el-table>
          <Pagination
            :total="total"
            v-model:page="queryParams.pageNo"
            v-model:limit="queryParams.pageSize"
            @pagination="getList"
          />
          <!-- 底部按钮 -->
        </ContentWrap>
      </el-col>
    </el-row>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="handleConfirm" :disabled="!hasSelection">
          确定
        </el-button>
        <el-button @click="handleClose">取消</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { isEmpty } from '@/utils/is'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { MaterialApi, Material } from '@/api/prj/material'
import { CategoryApi, Category } from '@/api/prj/category'
import CategoryTree from '../materialCategory/CategoryTree.vue'

interface Props {
  visible: boolean
  title?: string
  multiple?: boolean
  selectedIds?: number[]
  selectedId?: number // Prop 中的 selectedId
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  title: '选择材料',
  multiple: false,
  selectedIds: undefined,
  selectedId: undefined
})
const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: [data: Material | Material[]]
  close: []
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
const loading = ref(true) // 列表的加载中
const list = ref<Material[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const tableRef = ref()

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  categoryId: undefined,
  materialName: undefined,
  spec: undefined,
  brand: undefined,
  status: undefined
})
const queryFormRef = ref() // 搜索的表单

// 使用不同的变量名避免冲突
const checkedIds = ref([])

// 初始化选中状态
watch(
  () => props.visible,
  (val) => {
    if (val) {
      // checkedIds.value = props.selectedIds
      getList()
    }
  }
)

// 是否有选择
const hasSelection = computed(() => {
  return checkedIds.value.length > 0
})

// 获取选中的数据
const getSelectedData = () => {
  return list.value.filter((item) => checkedIds.value.includes(item.id!))
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await MaterialApi.getMaterialPage(queryParams)
    list.value = data.list
    total.value = data.total

    // 数据加载完成后设置选中状态
  } finally {
    loading.value = false
  }
  nextTick(() => {
    setTableSelection()
  })
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 行选择变化（多选模式） */
const handleRowCheckboxChange = (records: Material[]) => {
  checkedIds.value = records.map((item) => item.id!)
}

// 确定按钮
const handleConfirm = () => {
  const selectedData = getSelectedData()
  if (selectedData) {
    emit('confirm', selectedData)
    handleClose()
  }
}

/** 处理部门被点击 */
const handleCategoryNodeClick = async (row: any) => {
  if (row === undefined) {
    queryParams.categoryId = undefined
    await getList()
  } else {
    queryParams.categoryId = row.value
    await getList()
  }
}

// 关闭弹窗时重置
const handleClose = () => {
  emit('update:visible', false)
  emit('close')
  // 清空选择
  checkedIds.value = []
  // 重置查询条件
  resetQuery()
}

const categoryList = ref<Category[]>([]) // 分类列
const getCategoryList = async (unitName: string) => {
  try {
    categoryList.value = await CategoryApi.getCategoryList({
      unitName: unitName
    })
  } finally {
  }
}

// 获取分类名称的辅助方法
const getCategoryName = (categoryId: number | string): string => {
  if (!categoryList.value || !categoryId) {
    return '--'
  }
  const category = categoryList.value.find((item) => item.id === categoryId)
  return category ? category.categoryName : '--'
}
/** 设置表格选中状态 */
const setTableSelection = () => {
  if (!tableRef.value || !props.multiple) return
  // 先清空所有选中
  tableRef.value.clearSelection()
  console.log(props.selectedIds.value, 'props.selectedIds')

  console.log(checkedIds, 'checkedIds.')
  // 设置当前页的选中状态
  list.value.forEach((row) => {
    props.selectedIds.value.forEach((r) => {
      if (r === Number(row.id)) {
        tableRef.value?.toggleRowSelection(row, true)
      }
    })
  })
}
/** 初始化 */
onMounted(() => {
  getList()
  getCategoryList('')
})
</script>
