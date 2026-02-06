<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="材料分类" prop="categoryId">
        <el-select v-model="formData.categoryId" clearable filterable placeholder="请选择材料分类">
          <el-option
            v-for="item in categoryList"
            :key="item.id"
            :label="item.categoryName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="材料名称" prop="materialName">
        <el-input v-model="formData.materialName" placeholder="请输入材料名称" maxlength="50" />
      </el-form-item>
      <el-form-item label="计量单位" prop="unit">
        <el-input v-model="formData.unit" placeholder="请输入计量单位" maxlength="50" />
      </el-form-item>
      <el-form-item label="规格型号" prop="spec">
        <el-input v-model="formData.spec" placeholder="请输入规格型号" maxlength="50" />
      </el-form-item>
      <el-form-item label="品牌" prop="brand">
        <el-input v-model="formData.brand" placeholder="请输入品牌" maxlength="50" />
      </el-form-item>
      <el-form-item label="其他属性" prop="otherProperties">
        <el-input v-model="formData.otherProperties" placeholder="请输入其他属性" maxlength="50" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          placeholder="请输入备注"
          maxlength="250"
          type="textarea"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { MaterialApi, Material } from '@/api/prj/material'

/** 项目-材料 表单 */
defineOptions({ name: 'MaterialForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  categoryId: undefined,
  materialName: undefined,
  unit: undefined,
  spec: undefined,
  brand: undefined,
  otherProperties: undefined,
  quantity: undefined,
  remark: undefined
})
const formRules = reactive({
  materialName: [{ required: true, message: '材料名称不能为空', trigger: 'blur' }],
  unit: [{ required: true, message: '计量单位不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref
const categoryList = inject('categoryList')
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
      formData.value = await MaterialApi.getMaterial(id)
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
    const data = formData.value as unknown as Material
    if (formType.value === 'create') {
      await MaterialApi.createMaterial(data)
      message.success(t('common.createSuccess'))
    } else {
      await MaterialApi.updateMaterial(data)
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
    categoryId: undefined,
    materialName: undefined,
    unit: undefined,
    spec: undefined,
    brand: undefined,
    otherProperties: undefined,
    quantity: undefined,
    remark: undefined
  }
  formRef.value?.resetFields()
}
</script>
