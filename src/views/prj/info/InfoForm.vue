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
          <el-form-item label="项目名称" prop="prjName">
            <el-input
              v-model="formData.prjName"
              placeholder="请输入项目名称"
              :disabled="formType === 'update'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="项目编号" prop="prjNo">
            <el-input
              v-model="formData.prjNo"
              placeholder="请输入项目编号"
              :disabled="formType === 'update'"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="分类" prop="prjCategoryId">
            <el-select
              v-model="formData.prjCategoryId"
              clearable
              filterable
              placeholder="请选择分类"
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
        <el-col :span="12">
          <el-form-item label="项目状态" prop="prjStatus">
            <el-select
              v-model="formData.prjStatus"
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
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="甲方单位" prop="partyAId">
            <el-select
              v-model="formData.partyAId"
              clearable
              filterable
              placeholder="请选择甲方单位"
            >
              <el-option
                v-for="item in customerList"
                :key="item.id"
                :label="item.customerName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="项目负责人" prop="ownerId">
            <el-input v-model="formData.ownerId" placeholder="请输入项目负责人" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="开工日期" prop="startWorkDate">
            <el-date-picker
              v-model="formData.startWorkDate"
              clearable
              placeholder="请选择过期时间"
              type="date"
              value-format="x"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="竣工日期" prop="completeDate">
            <el-date-picker
              v-model="formData.completeDate"
              clearable
              placeholder="请选择过期时间"
              type="date"
              value-format="x"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row />
      <el-row>
        <el-col :span="12">
          <el-form-item label="施工单位" prop="constUnitId">
            <el-select
              v-model="formData.constUnitId"
              clearable
              filterable
              placeholder="请选择施工单位"
            >
              <el-option
                v-for="item in constUnitList"
                :key="item.id"
                :label="item.unitName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="施工地址" prop="constAddress">
            <el-input v-model="formData.constAddress" placeholder="请输入施工地址" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="归档状态" prop="archiveStatus">
            <el-select
              v-model="formData.archiveStatus"
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
        </el-col>
      </el-row>
      <el-form-item label="项目概况" prop="prjOverview">
        <el-input v-model="formData.prjOverview" placeholder="请输入项目概况" type="textarea" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" placeholder="请输入备注" type="textarea" />
      </el-form-item>
      <el-row>
        <el-form-item label="项目成员" prop="staffList">
          <div class="select-with-button">
            <el-select
              v-model="formData.staffList"
              multiple
              placeholder="请选择"
              :filterable="true"
              @remove-tag="handleRemoveTag"
              class="select-input"
              value-key="userId"
            >
              <el-option
                v-for="item in selectedManagerUsers"
                :key="item.id"
                :label="item.nickname"
                :value="{ userId: item.id, userName: item.nickname }"
              />
            </el-select>
            <el-button type="primary" @click="openManagerUserSelect" class="select-button">
              <Icon icon="ep:search" /> 选择
            </el-button>
          </div>
        </el-form-item>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>

  <!-- 用户选择弹窗 -->
  <UserSelectForm ref="userSelectFormRef" @confirm="handleUserSelectConfirm" />
</template>
<script setup lang="ts">
import { InfoApi, Info } from '@/api/prj/info'
import { CategoryApi, Category } from '@/api/prj/category'
import { CustomerApi, Customer } from '@/api/prj/customer'
import { InternalUnitApi, InternalUnit } from '@/api/prj/internalunit'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { UserVO } from '@/api/system/user'

/** 项目信息 表单 */
defineOptions({ name: 'InfoForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

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
  staffList: []
})
const formRules = reactive({
  prjName: [{ required: true, message: '项目名称不能为空', trigger: 'blur' }],
  prjNo: [{ required: true, message: '项目编号不能为空', trigger: 'blur' }],
  startWorkDate: [{ required: true, message: '开工日期不能为空', trigger: 'blur' }],
  prjStatus: [{ required: true, message: '项目状态不能为空', trigger: 'blur' }],
  ownerId: [{ required: true, message: '项目负责人不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref
const categoryList = ref<Category[]>([]) // 分类列表
const customerList = ref<Customer[]>([]) // 甲方列表
const constUnitList = ref<InternalUnit[]>([]) // 施工单位列表
/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  getCategoryList()
  getCustomerList()
  getInternalUnitList()
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await InfoApi.getInfo(id)
      selectedManagerUsers.value = formData.value.staffList
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
    remark: undefined
  }
  selectedManagerUsers.value = []
  formRef.value?.resetFields()
}

const userSelectFormRef = ref()
const selectedManagerUsers = ref<UserVO[]>([])
const currentSelectType = ref<'start' | 'manager'>('start')
// 存储从弹窗返回的用户对象数组
const selectedUsers = ref<UserVO[]>([])

/** 打开管理员选择 */
const openManagerUserSelect = () => {
  currentSelectType.value = 'manager'
  userSelectFormRef.value.open(0, selectedManagerUsers.value)
}

/** 处理用户选择确认 */
const handleUserSelectConfirm = (_, users: UserVO[]) => {
  // 1. 保存用户对象数组（用于显示）
  selectedUsers.value = users

  // 2. 将用户对象数组映射为需要的格式赋值给表单数据
  formData.value.staffList = users.map((user) => ({
    userId: user.id,
    userName: user.nickname // 这里使用 nickname，如果姓名在其他字段，请相应修改
  }))

  // 3. 如果需要在其他地方使用，可以再赋给 selectedManagerUsers
  selectedManagerUsers.value = users
}

/** 处理移除标签事件 */
const handleRemoveTag = (removedValue: number | string) => {
  // 从 selectedManagerUsers 中移除对应的用户对象
  const indexInUsers = selectedManagerUsers.value.findIndex((user) => user.id === removedValue)
  if (indexInUsers !== -1) {
    selectedManagerUsers.value.splice(indexInUsers, 1)
  }
}

const getCustomerList = async (customerName: string) => {
  try {
    customerList.value = await CustomerApi.getCustomerList({
      status: 1,
      customerName: customerName
    })
  } finally {
  }
}

const getCategoryList = async (categoryName: string) => {
  try {
    categoryList.value = await CategoryApi.getCategoryList({
      status: 1,
      categoryName: categoryName
    })
  } finally {
  }
}

const getInternalUnitList = async (unitName: string) => {
  try {
    constUnitList.value = await InternalUnitApi.getInternalUnitList({
      status: 1,
      unitName: unitName
    })
  } finally {
  }
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
