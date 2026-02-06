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
        <el-form-item label="单位名称" prop="unitName">
          <el-input
            v-model="queryParams.unitName"
            placeholder="请输入单位名称"
            clearable
            @keyup.enter="handleQuery"
            class="!w-240px"
          />
        </el-form-item>
        <el-form-item label="联系人姓名" prop="contactName">
          <el-input
            v-model="queryParams.contactName"
            placeholder="请输入联系人姓名"
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
            v-hasPermi="['prj:internal-unit:create']"
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
        <el-table-column v-if="props.multiple" type="selection" width="55" />
        <el-table-column v-else label="选择" width="55">
          <template #default="scope">
            <!-- 使用 internalSelectedId 而不是 selectedId -->
            <el-radio v-model="internalSelectedId" :label="scope.row.id">
              <span></span>
            </el-radio>
          </template>
        </el-table-column>
        <el-table-column type="selection" width="55" />
        <el-table-column label="单位名称" align="center" prop="unitName" />
        <el-table-column label="联系人姓名" align="center" prop="contactName">
          <template #default="scope">
            {{ scope.row.contactName || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="联系人电话" align="center" prop="contactPhone">
          <template #default="scope">
            {{ scope.row.contactPhone || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="办公地点" align="center" prop="officeLocation">
          <template #default="scope">
            {{ scope.row.officeLocation || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" prop="status">
          <template #default="scope">
            <el-switch disabled v-model="scope.row.status" :active-value="1" :inactive-value="0" />
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
    <InternalUnitForm ref="formRef" @success="getList" />
  </el-dialog>
</template>

<script setup lang="ts">
import { isEmpty } from '@/utils/is'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { InternalUnitApi, InternalUnit } from '@/api/prj/internalunit'
import InternalUnitForm from './InternalUnitForm.vue'

interface Props {
  visible: boolean
  title?: string
  multiple?: boolean
  selectedIds?: number[]
  selectedId?: number // Prop 中的 selectedId
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  title: '选择内部单位',
  multiple: false,
  selectedIds: () => [],
  selectedId: undefined
})
const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: [data: InternalUnit | InternalUnit[]]
  close: []
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
const loading = ref(true) // 列表的加载中
const list = ref<InternalUnit[]>([]) // 列表的数据
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
    const data = await InternalUnitApi.getInternalUnitPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
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

/** 行选择变化（多选模式） */
const handleRowCheckboxChange = (records: InternalUnit[]) => {
  checkedIds.value = records.map((item) => item.id!)
}

// 行点击事件（单选模式）
const handleRowClick = (row: InternalUnit) => {
  if (!props.multiple) {
    internalSelectedId.value = row.id
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
