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
          <el-form-item label="甲方单位" prop="partyAId">
            <el-input
              v-model="formData.partyAName"
              placeholder="请选择甲方单位"
              clearable
              @clear="handleClearPartyA"
              @click="openCustomerSelectDialog"
              style="cursor: pointer"
            >
              <!-- <template #suffix>
                <el-icon @click.stop="openCustomerSelectDialog">
                  <ArrowDown />
                </el-icon>
              </template> -->
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="项目负责人" prop="ownerId">
            <div class="flex flex-wrap gap-2">
              <div
                v-for="user in selectedOwnerUsers"
                :key="user.id"
                class="bg-gray-100 h-35px rounded-3xl flex items-center pr-8px dark:color-gray-600 position-relative"
              >
                <el-avatar class="!m-5px" :size="28" v-if="user.avatar" :src="user.avatar" />
                <el-avatar class="!m-5px" :size="28" v-else>
                  {{ user.nickname.substring(0, 1) }}
                </el-avatar>
                {{ user.nickname }}
                <Icon
                  icon="ep:close"
                  class="ml-2 cursor-pointer hover:text-red-500"
                  @click="handleRemoveOwnerUser"
                />
              </div>
              <el-button type="primary" link @click="openOwnerUserSelect">
                <Icon icon="ep:plus" />选择人员
              </el-button>
            </div>
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
                v-for="item in filteredCategoryList"
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
                v-for="item in filteredUnitList"
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
        <el-form-item label="项目成员" prop="staffUserIds">
          <div class="flex flex-wrap gap-2">
            <div
              v-for="user in selectedStaffUsers"
              :key="user.id"
              class="bg-gray-100 h-35px rounded-3xl flex items-center pr-8px dark:color-gray-600 position-relative"
            >
              <el-avatar class="!m-5px" :size="28" v-if="user.avatar" :src="user.avatar" />
              <el-avatar class="!m-5px" :size="28" v-else>
                {{ user.nickname.substring(0, 1) }}
              </el-avatar>
              {{ user.nickname }}
              <Icon
                icon="ep:close"
                class="ml-2 cursor-pointer hover:text-red-500"
                @click="handleRemoveManagerUser(user)"
              />
            </div>
            <el-button type="primary" link @click="openManagerUserSelect">
              <Icon icon="ep:plus" />选择人员
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

  <UserSelectForm ref="userSelectFormRef" @confirm="handleUserSelectConfirm" />

  <UserSelectSingleChoiceForm
    ref="userSelectSingleChoiceFormRef"
    @confirm="handleOwnerSelectConfirm"
  />

  <!-- 客户选择弹窗 -->
  <CustomerSelectDialog
    v-model:visible="showCustomerDialog"
    title="选择甲方单位"
    :multiple="false"
    @confirm="handlePartyASelect"
  />
</template>
<script setup lang="ts">
import { InfoApi, Info } from '@/api/prj/info'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { UserVO } from '@/api/system/user'
import { inject, computed } from 'vue'
import CustomerSelectDialog from '../prjComponents/customer/CustomerSelectDialog.vue'

const props = defineProps({
  userList: {
    type: Array,
    required: true
  }
})
/** 项目信息 表单 */
defineOptions({ name: 'InfoForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const formRef = ref() // 表单 Ref
const categoryList = inject('categoryList')
const filteredCategoryList = computed(() => {
  return categoryList.value.filter((item) => item.status === 1)
})
const customerList = inject('customerList')
const filteredCustomerList = computed(() => {
  return customerList.value.filter((item) => item.status === 1)
})
const constUnitList = inject('constUnitList')
const filteredUnitList = computed(() => {
  return constUnitList.value.filter((item) => item.status === 1)
})
const userSelectFormRef = ref()
const userSelectSingleChoiceFormRef = ref()
const selectedStaffUsers = ref<UserVO[]>([])
const selectedOwnerUsers = ref<UserVO[]>([])
const currentSelectType = ref<'start' | 'manager'>('start')

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
  staffUserIds: []
})
const formRules = reactive({
  prjName: [{ required: true, message: '项目名称不能为空', trigger: 'blur' }],
  prjNo: [{ required: true, message: '项目编号不能为空', trigger: 'blur' }],
  startWorkDate: [{ required: true, message: '开工日期不能为空', trigger: 'blur' }],
  prjStatus: [{ required: true, message: '项目状态不能为空', trigger: 'blur' }],
  ownerId: [{ required: true, message: '项目负责人不能为空', trigger: 'blur' }]
})

onMounted(() => {
  // categoryList.value = categoryList.value.filter((item) => item.status === 1)
  // constUnitList.value = constUnitList.value.filter((item) => item.status === 1)
  customerList.value = customerList.value.filter((item) => item.status === 1)
})
// 初始化选中的用户
watch(
  () => formData.value,
  (newVal) => {
    if (newVal.staffUserIds?.length) {
      selectedStaffUsers.value = props.userList.filter((user: UserVO) =>
        newVal.staffUserIds.includes(user.id)
      ) as UserVO[]
    } else {
      selectedStaffUsers.value = []
    }
    if (newVal.ownerId) {
      // 根据 ownerId 查找对应的用户信息
      const ownerUser = props.userList.find((user: UserVO) => user.id === newVal.ownerId)
      if (ownerUser) {
        selectedOwnerUsers.value = [ownerUser] // 将负责人设置为选中状态
      }
    }
  },
  {
    immediate: true
  }
)
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
    remark: undefined
  }
  selectedStaffUsers.value = []
  selectedOwnerUsers.value = []
  formRef.value?.resetFields()
}

/** 打开管理员选择 */
const openManagerUserSelect = () => {
  currentSelectType.value = 'manager'
  userSelectFormRef.value.open(0, selectedStaffUsers.value)
}

/** 处理用户选择确认 */
const handleUserSelectConfirm = (_, users: UserVO[]) => {
  formData.value = {
    ...formData.value,
    staffUserIds: users.map((u) => u.id)
  }
}

/** 移除管理员 */
const handleRemoveManagerUser = (user: UserVO) => {
  formData.value = {
    ...formData.value,
    staffUserIds: formData.value.staffUserIds.filter((id: number) => id !== user.id)
  }
}

const handleOwnerSelectConfirm = (_, users: UserVO[]) => {
  console.log(users, 'users')
  formData.value.ownerId = users.id
  formData.value.ownerName = users.nickname
  selectedOwnerUsers.value = [users]
}
const handleRemoveOwnerUser = () => {
  selectedOwnerUsers.value = []
  formData.value.ownerId = null
  formData.value.ownerName = null
}
/** 打开管理员选择 */
const openOwnerUserSelect = () => {
  currentSelectType.value = 'manager'
  userSelectSingleChoiceFormRef.value.open(0, selectedStaffUsers.value)
}

const showCustomerDialog = ref(false)

// 打开客户选择弹窗
const openCustomerSelectDialog = () => {
  showCustomerDialog.value = true
}

// 处理客户选择
const handlePartyASelect = (customer: any) => {
  formData.value.partyAId = customer.id
  formData.value.partyAName = customer.customerName
}

// 清除选择
const handleClearPartyA = () => {
  console.log(123)
  formData.value.partyAId = undefined
  formData.value.partyAName = ''
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
