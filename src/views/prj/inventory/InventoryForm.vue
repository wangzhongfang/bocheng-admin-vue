<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="项目id" prop="prjId">
        <el-input v-model="formData.prjId" placeholder="请输入项目id" />
      </el-form-item>
      <el-form-item label="材料名称" prop="materialName">
        <el-input v-model="formData.materialName" placeholder="请输入材料名称" />
      </el-form-item>
      <el-form-item label="规格型号" prop="spec">
        <el-input v-model="formData.spec" placeholder="请输入规格型号" />
      </el-form-item>
      <el-form-item label="材料分类" prop="brand">
        <el-input v-model="formData.brand" placeholder="请输入材料分类" />
      </el-form-item>
      <el-form-item label="材料id" prop="materialId">
        <el-input v-model="formData.materialId" placeholder="请输入材料id" />
      </el-form-item>
      <el-form-item label="材料分类名称" prop="meterialName">
        <el-input v-model="formData.meterialName" placeholder="请输入材料分类名称" />
      </el-form-item>
      <el-form-item label="数量" prop="quantity">
        <el-input v-model="formData.quantity" placeholder="请输入数量" />
      </el-form-item>
      <el-form-item label="单位" prop="unit">
        <el-input v-model="formData.unit" placeholder="请输入单位" />
      </el-form-item>
      <el-form-item label="单价" prop="price">
        <el-input v-model="formData.price" placeholder="请输入单价" />
      </el-form-item>
      <el-form-item label="总额" prop="amount">
        <el-input v-model="formData.amount" placeholder="请输入总额" />
      </el-form-item>
      <el-form-item label="其他属性" prop="otherProperties">
        <el-input v-model="formData.otherProperties" placeholder="请输入其他属性" />
      </el-form-item>
      <el-form-item label="预算id" prop="budgetId">
        <el-input v-model="formData.budgetId" placeholder="请输入预算id" />
      </el-form-item>
      <el-form-item label="预算名称" prop="budgetName">
        <el-input v-model="formData.budgetName" placeholder="请输入预算名称" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { InventoryApi, Inventory } from '@/api/prj/inventory'

/** 项目-库存材料 表单 */
defineOptions({ name: 'InventoryForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  prjId: undefined,
  materialName: undefined,
  spec: undefined,
  brand: undefined,
  materialId: undefined,
  meterialName: undefined,
  quantity: undefined,
  unit: undefined,
  price: undefined,
  amount: undefined,
  otherProperties: undefined,
  budgetId: undefined,
  budgetName: undefined,
  remark: undefined,
})
const formRules = reactive({
})
const formRef = ref() // 表单 Ref

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
      formData.value = await InventoryApi.getInventory(id)
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
    const data = formData.value as unknown as Inventory
    if (formType.value === 'create') {
      await InventoryApi.createInventory(data)
      message.success(t('common.createSuccess'))
    } else {
      await InventoryApi.updateInventory(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    prjId: undefined,
    materialName: undefined,
    spec: undefined,
    brand: undefined,
    materialId: undefined,
    meterialName: undefined,
    quantity: undefined,
    unit: undefined,
    price: undefined,
    amount: undefined,
    otherProperties: undefined,
    budgetId: undefined,
    budgetName: undefined,
    remark: undefined,
  }
  formRef.value?.resetFields()
}
</script>