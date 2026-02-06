<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="50%">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="130px"
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
      <el-divider content-position="left">资金情况</el-divider>

      <el-row>
        <el-col :span="12">
          <el-form-item label="资金正负" prop="fundsDirection">
            <el-radio v-model="formData.fundsDirection" :label="1">正</el-radio>
            <el-radio v-model="formData.fundsDirection" :label="0">负</el-radio>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="期初资金（￥）" prop="fundsAmount">
            <el-input v-model="formData.fundsAmount" placeholder="请输入期初资金（￥）" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { InfoApi, Info } from '@/api/prj/info'

/** 项目信息 表单 */
defineOptions({ name: 'InfoForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const formRef = ref() // 表单 Ref

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  prjName: undefined,
  prjNo: undefined,
  prjOverview: undefined,
  participateStatus: undefined,
  archiveStatus: undefined,
  prjStatus: undefined,
  prjCategory: undefined,
  ownerId: undefined,
  ownerName: undefined,
  startWorkDate: undefined,
  completeDate: undefined,
  partyAId: undefined,
  partyAName: undefined,
  constUnitId: undefined,
  constUnitName: undefined,
  constAddress: undefined,
  remark: undefined,
  staffUserIds: [],
  fundsDirection: 1,
  fundsAmount: undefined
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

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    prjName: undefined,
    prjNo: undefined,
    prjOverview: undefined,
    participateStatus: undefined,
    archiveStatus: undefined,
    prjStatus: undefined,
    prjCategory: undefined,
    ownerId: undefined,
    ownerName: undefined,
    startWorkDate: undefined,
    completeDate: undefined,
    partyAId: undefined,
    partyAName: undefined,
    constUnitId: undefined,
    constUnitName: undefined,
    constAddress: undefined,
    remark: undefined,
    fundsDirection: 1,
    fundsAmount: undefined
  }
  formRef.value?.resetFields()
}
</script>
<style scoped>
/* 方案一：Flex 布局 */
.select-with-button {
  display: flex;
  align-items: center;
  gap: 10px; /* 设置间距 */
}

.select-input {
  width: 100%;
}

.select-button {
  flex-shrink: 0; /* 防止按钮被压缩 */
  white-space: nowrap; /* 防止按钮文字换行 */
}
</style>
