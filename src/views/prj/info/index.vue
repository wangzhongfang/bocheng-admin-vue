<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="85px"
    >
      <el-form-item label="项目名称" prop="prjName">
        <el-input
          v-model="queryParams.prjName"
          placeholder="请输入项目名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="项目编号" prop="prjNo">
        <el-input
          v-model="queryParams.prjNo"
          placeholder="请输入项目编号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="归档状态" prop="archiveStatus">
        <el-select
          v-model="queryParams.archiveStatus"
          class="!w-240px"
          clearable
          placeholder="请选择归档状态"
          filterable
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.PRJ_ARCHIVE_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="项目状态" prop="prjStatus">
        <el-select
          v-model="queryParams.prjStatus"
          class="!w-240px"
          clearable
          placeholder="请选择项目状态"
          filterable
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.PRJ_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
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

      <el-form-item label="项目负责人" prop="ownerName">
        <el-input
          v-model="queryParams.ownerName"
          placeholder="请输入项目负责人"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="开工日期" prop="startWorkDate">
        <el-date-picker
          v-model="queryParams.startWorkDate"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="竣工日期" prop="completeDate">
        <el-date-picker
          v-model="queryParams.completeDate"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-240px"
        />
      </el-form-item>

      <el-form-item label="甲方单位" prop="partyAId">
        <el-select
          v-model="queryParams.partyAId"
          clearable
          filterable
          remote
          placeholder="请选择甲方单位"
          class="!w-240px"
          :remote-method="getCustomerList"
        >
          <el-option
            v-for="item in customerList"
            :key="item.id"
            :label="item.customerName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="施工单位" prop="constUnitId">
        <el-select
          v-model="queryParams.constUnitId"
          clearable
          filterable
          remote
          placeholder="请选择施工单位"
          class="!w-240px"
          :remote-method="getCategoryList"
        >
          <el-option
            v-for="item in constUnitList"
            :key="item.id"
            :label="item.unitName"
            :value="item.id"
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
          v-hasPermi="['prj:info:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['prj:info:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
        <el-button
          type="danger"
          plain
          :disabled="isEmpty(checkedIds)"
          @click="handleDeleteBatch"
          v-hasPermi="['prj:info:delete']"
        >
          <Icon icon="ep:delete" class="mr-5px" /> 批量删除
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
    >
      <el-table-column type="selection" width="55" />

      <el-table-column label="项目名称" align="center" prop="prjName" width="200px" />
      <el-table-column label="参与状态" align="center" prop="participateStatus">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.PARTICIPATE_STATUS" :value="scope.row.participateStatus" />
        </template>
      </el-table-column>
      <el-table-column label="归档状态" align="center" prop="archiveStatus">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.PRJ_ARCHIVE_STATUS" :value="scope.row.archiveStatus" />
        </template>
      </el-table-column>
      <el-table-column label="项目编号" align="center" prop="prjNo">
        <template #default="scope">
          <span>{{ scope.row.prjNo || '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="项目状态" align="center" prop="prjStatus">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.PRJ_STATUS" :value="scope.row.prjStatus" />
        </template>
      </el-table-column>
      <el-table-column label="项目分类" align="center" prop="prjCategoryId">
        <template #default="scope">
          <span>{{ getCategoryName(scope.row.prjCategoryId) || '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="项目负责人" align="center" prop="ownerName" width="120px">
        <template #default="scope">
          <span>{{ scope.row.ownerName || '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="开工日期" align="center" prop="startWorkDate">
        <template #default="scope">
          <span>{{ formatToDate(scope.row.startWorkDate) || '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="竣工日期" align="center" prop="completeDate">
        <template #default="scope">
          <span>{{ formatToDate(scope.row.completeDate) || '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="甲方单位" align="center" prop="partyAId">
        <template #default="scope">
          <span>{{ getPartyAName(scope.row.partyAId) || '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="施工单位" align="center" prop="constUnitId">
        <template #default="scope">
          <span>{{ getContUnitName(scope.row.constUnitId) || '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="施工地址" align="center" prop="constAddress">
        <template #default="scope">
          <span>{{ scope.row.constAddress || '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['prj:info:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['prj:info:delete']"
          >
            删除
          </el-button>
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

  <!-- 表单弹窗：添加/修改 -->
  <InfoForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { isEmpty } from '@/utils/is'
import { formatToDate } from '@/utils/dateUtil'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import download from '@/utils/download'
import { InfoApi, Info } from '@/api/prj/info'
import { CategoryApi, Category } from '@/api/prj/category'
import { CustomerApi, Customer } from '@/api/prj/customer'
import { InternalUnitApi, InternalUnit } from '@/api/prj/internalunit'
import InfoForm from './InfoForm.vue'

/** 项目信息 列表 */
defineOptions({ name: 'PrjInfo' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<Info[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  prjName: undefined,
  prjNo: undefined,
  prjOverview: undefined,
  participateStatus: undefined,
  archiveStatus: undefined,
  prjStatus: undefined,
  prjCategoryId: undefined,
  ownerId: undefined,
  ownerName: undefined,
  startWorkDate: [],
  completeDate: [],
  partyAId: undefined,
  constUnitId: undefined,
  constAddress: undefined,
  remark: undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

const categoryList = ref<Category[]>([]) // 分类列表
const customerList = ref<Customer[]>([]) // 甲方列表
const constUnitList = ref<InternalUnit[]>([]) // 施工单位列表

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await InfoApi.getInfoPage(queryParams)
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
    await InfoApi.deleteInfo(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 批量删除项目信息 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await InfoApi.deleteInfoList(checkedIds.value)
    checkedIds.value = []
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: Info[]) => {
  checkedIds.value = records.map((item) => item.id!)
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await InfoApi.exportInfo(queryParams)
    download.excel(data, '项目信息.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

const getCustomerList = async (customerName: string) => {
  try {
    customerList.value = await CustomerApi.getCustomerList({
      customerName: customerName
    })
  } finally {
  }
}

const getCategoryList = async (unitName: string) => {
  try {
    categoryList.value = await CategoryApi.getCategoryList({
      unitName: unitName
    })
  } finally {
  }
}

const getInternalUnitList = async () => {
  try {
    constUnitList.value = await InternalUnitApi.getInternalUnitList()
  } finally {
  }
}

/** 初始化 **/
onMounted(async () => {
  getList()
  getCategoryList()
  getCustomerList()
  getInternalUnitList()
})

// 获取分类名称的辅助方法
const getCategoryName = (categoryId: number | string): string => {
  if (!categoryList.value || !categoryId) {
    return '--'
  }
  const category = categoryList.value.find((item) => item.id === categoryId)
  return category ? category.categoryName : '--'
}

const getPartyAName = (partyAId: number | string): string => {
  if (!customerList.value || !partyAId) {
    return '--'
  }
  const customer = customerList.value.find((item) => item.id === partyAId)
  return customer ? customer.customerName : '--'
}

const getContUnitName = (constUnitId: number | string): string => {
  if (!constUnitList.value || !constUnitId) {
    return '--'
  }
  const constUnit = constUnitList.value.find((item) => item.id === constUnitId)
  return constUnit ? constUnit.unitName : '--'
}
</script>
