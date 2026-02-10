<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="150px"
      v-loading="formLoading"
    >
      <el-form-item label="二级预算类型" prop="budgetName">
        <el-input v-model="formData.budgetName" placeholder="请输入二级预算类型" maxlength="50" />
      </el-form-item>
      <el-form-item label="二级预算类型编码" prop="budgetCode">
        <el-input
          v-model="formData.budgetCode"
          placeholder="请输入二级预算类型编码"
          maxlength="50"
        />
      </el-form-item>
      <el-form-item label="预算类型" prop="parentId">
        <el-select
          v-model="formData.parentId"
          clearable
          filterable
          placeholder="请选择分类"
          class="!w-240px"
        >
          <el-option
            v-for="item in budgetTypeList"
            :key="item.id"
            :label="item.budgetName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="formData.status"
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
import { BudgetTypeApi, BudgetType } from '@/api/prj/budgettype'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'

/** 项目-预算类型 表单 */
defineOptions({ name: 'BudgetTypeForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  budgetName: undefined,
  budgetLevel: 2,
  budgetCode: undefined,
  parentId: undefined,
  status: 1,
  remark: undefined
})
const formRules = reactive({
  budgetName: [{ required: true, message: '二级预算类型不能为空', trigger: 'blur' }],
  parentId: [{ required: true, message: '预算类型不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref
const budgetTypeList = inject('budgetTypeList')

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
      formData.value = await BudgetTypeApi.getBudgetType(id)
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
    const data = formData.value as unknown as BudgetType
    if (formType.value === 'create') {
      await BudgetTypeApi.createBudgetType(data)
      message.success(t('common.createSuccess'))
    } else {
      await BudgetTypeApi.updateBudgetType(data)
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
    budgetName: undefined,
    budgetLevel: 2,
    budgetCode: undefined,
    status: 1,
    remark: undefined
  }
  formRef.value?.resetFields()
}
</script>
