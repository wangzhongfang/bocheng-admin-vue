<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    width="1200px"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <ContentWrap>
      <!-- 搜索工作栏 -->
      <el-form
        class="-mb-15px"
        :model="queryParams"
        ref="queryFormRef"
        :inline="true"
        label-width="85px"
      >
        <el-form-item label="客户名称" prop="customerName">
          <el-input
            v-model="queryParams.customerName"
            placeholder="请输入客户名称"
            clearable
            @keyup.enter="handleQuery"
            class="!w-240px"
          />
        </el-form-item>
        <el-form-item label="分类" prop="prjCategoryId">
          <el-select
            v-model="queryParams.prjCategoryId"
            clearable
            filterable
            placeholder="请选择分类"
            class="!w-240px"
          >
            <el-option
              v-for="item in categoryList"
              :key="item.id"
              :label="item.categoryName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="联系人" prop="contactName">
          <el-input
            v-model="queryParams.contactName"
            placeholder="请输入联系人"
            clearable
            @keyup.enter="handleQuery"
            class="!w-240px"
          />
        </el-form-item>
        <el-form-item label="联系人电话" prop="contactPhone">
          <el-input
            v-model="queryParams.contactPhone"
            placeholder="请输入联系人电话"
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
          <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
          <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
          <el-button
            type="primary"
            plain
            @click="openForm('create')"
            v-hasPermi="['prj:customer:create']"
          >
            <Icon icon="ep:plus" class="mr-5px" /> 新增
          </el-button>
        </el-form-item>
      </el-form>
    </ContentWrap>

    <!-- 列表 -->
    <ContentWrap>
      <el-table
        row-key="id"
        v-loading="loading"
        :data="list"
        :stripe="true"
        :show-overflow-tooltip="true"
        @selection-change="handleRowCheckboxChange"
        @row-click="handleRowClick"
      >
        <!-- 根据选择模式显示不同的列 -->
        <el-table-column v-if="props.multiple" type="selection" width="55" />
        <el-table-column v-else label="选择" width="55">
          <template #default="scope">
            <!-- 使用 internalSelectedId 而不是 selectedId -->
            <el-radio v-model="internalSelectedId" :label="scope.row.id">
              <span></span>
            </el-radio>
          </template>
        </el-table-column>

        <el-table-column label="客户名称" align="center" prop="customerName" />
        <el-table-column label="分类" align="center" prop="prjCategoryName">
          <template #default="scope">
            {{ scope.row.prjCategoryName || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="联系人" align="center" prop="contactName">
          <template #default="scope">
            {{ scope.row.contactName || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="联系人电话" align="center" prop="contactPhone">
          <template #default="scope">
            {{ scope.row.contactPhone || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" prop="status">
          <template #default="scope">
            <el-switch
              disabled
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              @change="changeStatus(scope.row)"
            />
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <Pagination
        :total="total"
        v-model:page="queryParams.pageNo"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />
    </ContentWrap>

    <!-- 底部按钮 -->
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="handleConfirm" :disabled="!hasSelection">
          确定
        </el-button>
        <el-button @click="handleClose">取消</el-button>
      </span>
    </template>

    <!-- 表单弹窗：添加/修改 -->
    <CustomerForm ref="formRef" @success="getList" />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { isEmpty } from '@/utils/is'
import { dateFormatter } from '@/utils/formatTime'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import download from '@/utils/download'
import { CustomerApi, Customer } from '@/api/prj/customer'
import { CategoryApi, Category } from '@/api/prj/category'
import CustomerForm from './CustomerForm.vue'

interface Props {
  visible: boolean
  title?: string
  multiple?: boolean
  selectedIds?: number[]
  selectedId?: number // Prop 中的 selectedId
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  title: '选择客户',
  multiple: false,
  selectedIds: () => [],
  selectedId: undefined
})
const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: [data: Customer | Customer[]]
  close: []
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
const loading = ref(true) // 列表的加载中
const list = ref<Customer[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  customerName: undefined,
  prjCategoryId: undefined,
  contactName: undefined,
  contactPhone: undefined,
  status: undefined
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

const categoryList = ref<Category[]>([]) // 分类列表

// 使用不同的变量名避免冲突
const internalSelectedId = ref<number>()
const checkedIds = ref<number[]>([])

// 初始化选中状态
watch(
  () => props.visible,
  (val) => {
    if (val) {
      if (props.multiple) {
        checkedIds.value = [...props.selectedIds]
      } else {
        internalSelectedId.value = props.selectedId
      }
      getList()
      getCategoryList()
    }
  }
)

// 是否有选择
const hasSelection = computed(() => {
  if (props.multiple) {
    return checkedIds.value.length > 0
  } else {
    return !!internalSelectedId.value
  }
})

// 获取选中的数据
const getSelectedData = () => {
  if (props.multiple) {
    return list.value.filter((item) => checkedIds.value.includes(item.id!))
  } else {
    return list.value.find((item) => item.id === internalSelectedId.value)
  }
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await CustomerApi.getCustomerPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 查询分类列表 */
const getCategoryList = async () => {
  try {
    categoryList.value = await CategoryApi.getCategoryList({ status: 1 })
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
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

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await CustomerApi.deleteCustomer(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 行选择变化（多选模式） */
const handleRowCheckboxChange = (records: Customer[]) => {
  checkedIds.value = records.map((item) => item.id!)
}

// 行点击事件（单选模式）
const handleRowClick = (row: Customer) => {
  if (!props.multiple) {
    internalSelectedId.value = row.id
  }
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await CustomerApi.exportCustomer(queryParams)
    download.excel(data, '客户信息.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 状态切换 */
const changeStatus = async (row: Customer) => {
  try {
    // 修改状态的二次确认
    const text = row.status ? '解封' : '封存'
    await message.confirm('确认要"' + text + '"该客户吗?')
    // 发起修改状态
    await CustomerApi.updateCustomer({
      id: row.id,
      status: row.status
    })
    await getList()
  } catch (e) {
    // 取消后，进行恢复按钮
    row.status = row.status === 1 ? 2 : 1
  }
}

// 确定按钮
const handleConfirm = () => {
  const selectedData = getSelectedData()
  if (selectedData) {
    emit('confirm', selectedData)
    handleClose()
  }
}

// 关闭弹窗时重置
const handleClose = () => {
  emit('update:visible', false)
  emit('close')
  // 清空选择
  checkedIds.value = []
  internalSelectedId.value = undefined
  // 重置查询条件
  resetQuery()
}
</script>
