<template>
  <el-row :gutter="20">
    <!-- 左侧分类树 -->
    <el-col :span="4" :xs="24">
      <ContentWrap class="h-1/1">
        <BudgetTypeTree @node-click="handleBudgetTypeNodeClick" />
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
          <el-form-item label="类型名称" prop="budgetName">
            <el-input
              v-model="queryParams.budgetName"
              placeholder="请输入类型名称"
              clearable
              @keyup.enter="handleQuery"
              class="!w-240px"
            />
          </el-form-item>
          <el-form-item label="类型编码" prop="budgetCode">
            <el-input
              v-model="queryParams.budgetCode"
              placeholder="请输入类型编码"
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
            <el-button
              type="danger"
              plain
              :disabled="checkedIds.length === 0"
              @click="handleDeleteBatch"
              v-hasPermi="['system:user:delete']"
            >
              <Icon icon="ep:delete" />批量删除
            </el-button>
          </el-form-item>
        </el-form>
      </ContentWrap>
      <ContentWrap>
        <el-table v-loading="loading" :data="list" @selection-change="handleRowCheckboxChange">
          <el-table-column type="selection" width="55" />
          <el-table-column label="预算名称" align="center" prop="budgetName" />
          <el-table-column label="预算编码" align="center" prop="budgetCode">
            <template #default="scope">
              <span>{{ scope.row.budgetCode || '--' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="预算类型" align="center" prop="parentId">
            <template #default="scope">
              <span>{{ getBudgetTypeName(scope.row.parentId) || '--' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center" prop="status">
            <template #default="scope">
              <el-switch
                v-model="scope.row.status"
                :active-value="1"
                :inactive-value="0"
                @change="changeStatus(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="160">
            <template #default="scope">
              <el-button
                link
                type="primary"
                @click="openForm('update', scope.row.id)"
                v-hasPermi="['prj:material:update']"
              >
                编辑
              </el-button>
              <el-button
                link
                type="danger"
                @click="handleDelete(scope.row.id)"
                v-hasPermi="['prj:material:delete']"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <Pagination
          :total="total"
          v-model:page="queryParams.pageNo"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
        />
      </ContentWrap>
    </el-col>
  </el-row>

  <!-- 添加或修改用户对话框 -->
  <BudgetTypeForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { BudgetTypeApi, BudgetType } from '@/api/prj/budgettype'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import BudgetTypeTree from '../prjComponents/budgetType/BudgetTyepTree.vue'
import BudgetTypeForm from './BudgetTypeForm.vue'

/** 项目-预算类型 列表 */
defineOptions({ name: 'BudgetType' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<BudgetType[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  budgetName: undefined,
  budgetLevel: undefined,
  budgetCode: undefined,
  status: undefined,
  remark: undefined,
  createTime: [],
  parentId: undefined
})
const queryFormRef = ref() // 搜索的表单

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await BudgetTypeApi.getBudgetTypePage(queryParams)
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
  queryFormRef.value.resetFields()
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
    await BudgetTypeApi.deleteBudgetType(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 批量删除项目-预算类型 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await BudgetTypeApi.deleteBudgetTypeList(checkedIds.value)
    checkedIds.value = []
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: BudgetType[]) => {
  checkedIds.value = records.map((item) => item.id!)
}

const changeStatus = async (row: BudgetType) => {
  try {
    // 修改状态的二次确认
    const text = row.status ? '解封' : '封存'
    await message.confirm('确认要"' + text + '"该预算类型吗?')
    // 发起修改状态
    await BudgetTypeApi.updateBudgetType({
      id: row.id,
      status: row.status
    })
    await getList()
  } catch (e) {
    // 取消后，进行恢复按钮
    row.status = row.status === 1 ? 2 : 1
  }
}

/** 处理部门被点击 */
const handleBudgetTypeNodeClick = async (row: any) => {
  if (row === undefined) {
    queryParams.parentId = undefined
    await getList()
  } else {
    queryParams.parentId = row.value
    await getList()
  }
}
const budgetTypeList = ref<BudgetType[]>([]) // 分类列
provide('budgetTypeList', budgetTypeList)

const getBudgetTypeListAll = async (budgetName: string) => {
  try {
    budgetTypeList.value = await BudgetTypeApi.getBudgetTypeListAll({
      budgetLevel: 1
    })
  } finally {
  }
}

// 获取分类名称的辅助方法
const getBudgetTypeName = (budgetTyepId: number | string): string => {
  if (!budgetTypeList.value || !budgetTyepId) {
    return '--'
  }
  const budget = budgetTypeList.value.find((item) => item.id === budgetTyepId)
  return budget ? budget.budgetName : '--'
}
const budgetTypeTreeRef = ref<InstanceType<typeof BudgetTypeTree>>()
/** 初始化 **/
onMounted(async () => {
  getList()
  getBudgetTypeListAll({})
})
</script>
