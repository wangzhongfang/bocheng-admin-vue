<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="50%">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="客户名称" prop="customerName">
            <el-input v-model="formData.customerName" placeholder="请输入客户名称" maxlength="50" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="分类" prop="prjCategoryId">
            <el-select
              v-model="formData.prjCategoryId"
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
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="联系人姓名" prop="contactName">
            <el-input
              v-model="formData.contactName"
              placeholder="请输入联系人姓名"
              maxlength="50"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系人电话" prop="contactPhone">
            <el-input
              v-model="formData.contactPhone"
              placeholder="请输入联系人电话"
              maxlength="50"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="办公地点" prop="officeLocation">
            <el-input
              v-model="formData.officeLocation"
              placeholder="请输入办公地点"
              maxlength="150"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="发票抬头" prop="invoiceTitle">
            <el-input
              v-model="formData.invoiceTitle"
              placeholder="请输入发票抬头"
              maxlength="150"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="税号" prop="taxNo">
            <el-input v-model="formData.taxNo" placeholder="请输入税号" maxlength="150" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="地址" prop="address">
            <el-input v-model="formData.address" placeholder="请输入地址" maxlength="150" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="电话" prop="phone">
            <el-input v-model="formData.phone" placeholder="请输入电话" maxlength="50" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="开户行" prop="bankName">
            <el-input v-model="formData.bankName" placeholder="请输入开户行" maxlength="50" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="银行卡号" prop="bankCard">
            <el-input v-model="formData.bankCard" placeholder="请输入银行卡号" maxlength="50" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
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
        </el-col>
      </el-row>

      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          placeholder="请输入备注"
          type="textarea"
          maxlength="250"
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
import { CustomerApi, Customer } from '@/api/prj/customer'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
/** 客户信息 表单 */
defineOptions({ name: 'CustomerForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  customerName: undefined,
  prjCategoryId: undefined,
  contactName: undefined,
  contactPhone: undefined,
  officeLocation: undefined,
  invoiceTitle: undefined,
  taxNo: undefined,
  address: undefined,
  phone: undefined,
  bankName: undefined,
  bankCard: undefined,
  status: 1,
  remark: undefined
})
const formRules = reactive({
  customerName: [{ required: true, message: '客户名称不能为空', trigger: 'blur' }]
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
      formData.value = await CustomerApi.getCustomer(id)
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
    const data = formData.value as unknown as Customer
    if (formType.value === 'create') {
      await CustomerApi.createCustomer(data)
      message.success(t('common.createSuccess'))
    } else {
      await CustomerApi.updateCustomer(data)
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
    customerName: undefined,
    prjCategoryId: undefined,
    contactName: undefined,
    contactPhone: undefined,
    officeLocation: undefined,
    invoiceTitle: undefined,
    taxNo: undefined,
    address: undefined,
    phone: undefined,
    bankName: undefined,
    bankCard: undefined,
    status: 1,
    remark: undefined
  }
  formRef.value?.resetFields()
}
</script>
