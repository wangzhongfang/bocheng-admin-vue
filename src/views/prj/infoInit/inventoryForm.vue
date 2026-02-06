<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="80%">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="项目名称" prop="prjName">
            <el-input v-model="formData.prjName" placeholder="请输入项目名称" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="项目编号" prop="prjNo">
            <el-input v-model="formData.prjNo" placeholder="请输入项目编号" disabled />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="材料总金额（￥）" prop="inventoryAmount">
            <el-input
              v-model="formData.inventoryAmount"
              placeholder="由材料总额计算得出"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-divider content-position="left">库存明细</el-divider>
      <!-- 搜索工作栏 -->
      <ContentWrap>
        <el-form
          class="-mb-15px"
          :model="queryParams"
          ref="queryFormRef"
          :inline="true"
          label-width="85px"
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
          <el-form-item>
            <el-button @click="handleQuery"
              ><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button
            >
            <el-button @click="resetQuery"
              ><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button
            >
            <el-button type="primary" plain @click="handleAdd()">
              <Icon icon="ep:plus" class="mr-5px" /> 新增
            </el-button>
          </el-form-item>
        </el-form>
      </ContentWrap>
      <ContentWrap>
        <el-table
          row-key="id"
          v-loading="formLoading"
          :data="inventoryList"
          :stripe="true"
          :show-overflow-tooltip="true"
        >
          <el-table-column label="材料名称" align="center" prop="materialName">
            <template #default="scope">
              <el-input
                v-model="scope.row.materialName"
                placeholder="请选择材料名称"
                clearable
                @clear="handleClearMaterial"
                @click="openMaterialSelectDialog"
                style="cursor: pointer"
              />
            </template>
          </el-table-column>
          <el-table-column label="规格型号" align="center" prop="spec" />
          <el-table-column label="品牌" align="center" prop="brand" />
          <el-table-column label="材料分类" align="center" prop="meterialName" />
          <el-table-column label="数量" align="center" prop="quantity" />
          <el-table-column label="单位" align="center" prop="unit" />
          <el-table-column label="单价" align="center" prop="price" />
          <el-table-column label="总额" align="center" prop="amount" />
          <el-table-column label="备注" align="center" prop="remark" />
          <el-table-column label="其他属性" align="center" prop="otherProperties" />
          <el-table-column label="预算名称" align="center" prop="budgetName" />
          <el-table-column label="操作" align="center" min-width="120px">
            <template #default="scope">
              <el-button
                link
                type="danger"
                @click="handleDelete(scope.row.id)"
                v-hasPermi="['prj:inventory:delete']"
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
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>

  <!-- 添加库存材料表单弹窗：添加/修改 -->
  <!-- <InventoryAddForm ref="formInventoryRef" @success="getList" /> -->
</template>
<script setup lang="ts">
import { InfoApi, Info } from '@/api/prj/info'
import { InventoryApi, Inventory } from '@/api/prj/inventory'
import InventoryAddForm from './inventoryAddForm.vue'

/** 项目信息 表单 */
defineOptions({ name: 'InfoForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const formRef = ref() // 表单 Ref

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const queryFormRef = ref() // 搜索的表单
const formData = ref({
  id: undefined,
  prjName: undefined,
  prjNo: undefined,
  fundsDirection: 1,
  fundsAmount: undefined,
  inventoryAmount: undefined
})
const inventoryList = ref([])
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  prjId: undefined,
  materialName: ''
})
const formRules = reactive({
  fundsDirection: [{ required: true, message: '资金正负不能为空', trigger: 'blur' }],
  fundsAmount: [{ required: true, message: '期初资金（￥）不能为空', trigger: 'blur' }]
})

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await InfoApi.getInfo(id)
      const data = await InventoryApi.getInventoryPage({
        prjId: id
      })
      inventoryList.value = data.list
      total.value = data.total
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as Info
    if (formType.value === 'create') {
      await InfoApi.createInfo(data)
      message.success(t('common.createSuccess'))
    } else {
      await InfoApi.updateInfo(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
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
/** 查询列表 */
const getList = async () => {
  formLoading.value = true
  try {
    const data = await InventoryApi.getInventoryPage({
      prjId: formData.value.id
    })
    inventoryList.value = data.list
    total.value = data.total
  } finally {
    formLoading.value = false
  }
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await InventoryApi.deleteInventory(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}
/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    prjName: undefined,
    prjNo: undefined,
    fundsDirection: 1,
    fundsAmount: undefined,
    inventoryAmount: undefined
  }
  inventoryList.value = []
  formRef.value?.resetFields()
}

/** 新增按钮操作 */
const handleAdd = () => {
  console.log(123)

  // 创建一条新的空数据对象
  const newRow = {
    id: '', // 使用时间戳作为唯一标识
    materialName: '',
    spec: '',
    brand: '',
    meterialName: '',
    quantity: '',
    unit: '',
    price: '',
    amount: '',
    remark: '',
    otherProperties: '',
    budgetName: ''
  }
  // 插入到 inventoryList 数组开头
  inventoryList.value.unshift(newRow)
}

const showInternalUnitDialog = ref(false)
// 打开材料选择弹窗
const openMaterialSelectDialog = () => {
  showInternalUnitDialog.value = true
}

// 处理材料单位选择
const handleMaterialSelect = (internalUnit: any) => {
  formData.value.constUnitId = internalUnit.id
  formData.value.constUnitName = internalUnit.unitName
}

// 清除材料单位选择
const handleClearMaterial = () => {
  formData.value.constUnitId = undefined
  formData.value.constUnitName = ''
}
</script>
<style scoped></style>
