<template>
  <el-row :gutter="20">
    <!-- 左侧部门树 -->
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
            <el-button
              type="success"
              plain
              @click="handleExport"
              :loading="exportLoading"
              v-hasPermi="['system:user:export']"
            >
              <Icon icon="ep:download" />导出
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
          <el-table-column label="分类id" align="center" prop="categoryId">
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
  <MaterialForm ref="formRef" @success="getList" />
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import download from '@/utils/download'
import { MaterialApi, Material } from '@/api/prj/material'
import { CategoryApi, Category } from '@/api/prj/category'
import MaterialForm from './MaterialForm.vue'
import CategoryTree from '../prjComponents/materialCategory/CategoryTree.vue'

defineOptions({ name: 'SystemUser' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数
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

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await MaterialApi.getMaterialPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}
const categoryList = ref<Category[]>([]) // 分类列
provide('categoryList', categoryList)

const getCategoryList = async (unitName: string) => {
  try {
    categoryList.value = await CategoryApi.getCategoryList({
      unitName: unitName
    })
  } finally {
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

/** 处理部门被点击 */
const handleCategoryNodeClick = async (row: any) => {
  console.log('点击分类:', row)
  if (row === undefined) {
    queryParams.categoryId = undefined
    await getList()
  } else {
    queryParams.categoryId = row.value
    await getList()
  }
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 修改状态 */
const changeStatus = async (row: Material) => {
  try {
    // 修改状态的二次确认
    const text = row.status ? '解封' : '封存'
    await message.confirm('确认要"' + text + '"该单位吗?')
    // 发起修改状态
    await MaterialApi.updateMaterial({
      id: row.id,
      status: row.status
    })
    await getList()
  } catch (e) {
    // 取消后，进行恢复按钮
    row.status = row.status === 1 ? 2 : 1
  }
}

/** 导出按钮操作 */
const exportLoading = ref(false)
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await MaterialApi.exportMaterial(queryParams)
    download.excel(data, '用户数据.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await MaterialApi.deleteMaterial(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 批量删除按钮操作 */
const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (rows: Material[]) => {
  checkedIds.value = rows.map((row) => row.id)
}

const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起批量删除
    await MaterialApi.deleteMaterialList(checkedIds.value)
    checkedIds.value = []
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}
// 获取分类名称的辅助方法
const getCategoryName = (categoryId: number | string): string => {
  if (!categoryList.value || !categoryId) {
    return '--'
  }
  const category = categoryList.value.find((item) => item.id === categoryId)
  return category ? category.categoryName : '--'
}

/** 初始化 */
onMounted(() => {
  getList()
  getCategoryList('')
})
</script>
