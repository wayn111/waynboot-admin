<template>
  <div class="app-container">
    <el-card class="box-card">
      <h3>商品介绍</h3>
      <el-form ref="goodsFormRef" :rules="rules" :model="goods" label-width="150px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="goods.name" />
        </el-form-item>
        <el-form-item label="市场售价" prop="counterPrice">
          <el-input v-model="goods.counterPrice" placeholder="0.00">
            <template #append>元</template>
          </el-input>
        </el-form-item>
        <!-- <el-form-item label="是否新品" prop="isNew">
          <el-radio-group v-model="goods.isNew">
            <el-radio :label="true">新品</el-radio>
            <el-radio :label="false">非新品</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否热卖" prop="isHot">
          <el-radio-group v-model="goods.isHot">
            <el-radio :label="false">普通</el-radio>
            <el-radio :label="true">热卖</el-radio>
          </el-radio-group>
        </el-form-item> -->
        <el-form-item label="是否在售" prop="isOnSale">
          <el-radio-group v-model="goods.isOnSale">
            <el-radio :label="true">在售</el-radio>
            <el-radio :label="false">未售</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="商品图片">
          <el-upload
            :action="uploadPath"
            :show-file-list="false"
            :headers="headers"
            :on-success="uploadPicUrl"
            class="avatar-uploader"
            accept=".jpg, .jpeg, .png, .gif"
          >
            <img v-if="goods.picUrl" :src="goods.picUrl" class="avatar">
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            <template #tip><div class="el-upload__tip">只能上传jpg、jpeg、png、gif文件，800 x 800</div></template>
          </el-upload>
        </el-form-item>

        <el-form-item label="宣传画廊">
          <el-upload
            :action="uploadPath"
            :limit="5"
            :headers="headers"
            :on-exceed="uploadOverrun"
            :on-success="handleGalleryUrl"
            :on-remove="handleRemove"
            multiple
            accept=".jpg, .jpeg, .png, .gif"
            list-type="picture-card"
          >
            <el-icon><Plus /></el-icon>
            <template #tip><div class="el-upload__tip">只能上传jpg、jpeg、png、gif文件，800 x 800</div></template>
          </el-upload>
        </el-form-item>

        <el-form-item label="商品单位" prop="unit">
          <el-input v-model="goods.unit" placeholder="件 / 个 / 盒" />
        </el-form-item>

        <el-form-item label="销量">
          <el-input
            v-model="goods.virtualSales"
            placeholder=""
          ><template #append>{{ goods.unit }}</template>
          </el-input>
        </el-form-item>

        <el-form-item label="关键字">
          <el-tag
            v-for="tag in keywords"
            :key="tag"
            closable
            type="primary"
            @close="handleClose(tag)"
          >{{ tag }}</el-tag>
          <el-input
            v-if="newKeywordVisible"
            ref="newKeywordInput"
            v-model="newKeyword"
            class="input-new-keyword"
            @keyup.enter="handleInputConfirm"
            @blur="handleInputConfirm"
          />
          <el-button v-else class="button-new-keyword" type="primary" @click="showInput">+ 增加</el-button>
        </el-form-item>

        <el-form-item label="所属分类" prop="categoryId">
          <el-cascader
            :options="categoryList"
            :props="props"
            clearable
            @change="handleCategoryChange"
          />
        </el-form-item>

        <!-- <el-form-item label="所属品牌商">
          <el-select v-model="goods.brandId" clearable>
            <el-option
              v-for="item in brandList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>-->

        <el-form-item label="商品简介">
          <el-input v-model="goods.brief" />
        </el-form-item>

        <el-form-item label="商品详细介绍">
          <editor v-model="goods.detail" :init="editorInit" :license-key="tinymceLicenseKey" />
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="box-card">
      <h3>商品规格</h3>
      <el-row :gutter="20" type="flex" align="middle" style="padding:20px 0;">
        <el-col :span="22">
          <el-radio-group v-model="multipleSpec" @change="specChanged">
            <el-radio-button :label="false">默认标准规格</el-radio-button>
            <el-radio-button :label="true">多规格支持</el-radio-button>
          </el-radio-group>
        </el-col>
        <el-col v-if="multipleSpec" :span="2">
          <el-button :plain="true" type="primary" @click="handleSpecificationShow">添加</el-button>
        </el-col>
      </el-row>

      <el-table border :data="specifications">
        <el-table-column property="specification" label="规格名" />
        <el-table-column property="value" label="规格值">
          <template #default="scope">
            <el-tag type="primary">{{ scope.row.value }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column property="picUrl" label="规格图片">
          <template #default="scope">
            <img v-if="scope.row.picUrl" :src="scope.row.picUrl" width="40">
          </template>
        </el-table-column>
        <el-table-column
          v-if="multipleSpec"
          align="center"
          label="操作"
          width="250"
          class-name="small-padding fixed-width"
        >
          <template #default="scope">
            <el-button type="danger" size="small" @click="handleSpecificationDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog v-model="specVisiable" title="设置规格">
        <el-form
          ref="specFormRef"
          :rules="rules"
          :model="specForm"
          status-icon
          label-position="left"
          label-width="100px"
          style="width: 400px; margin-left:50px;"
        >
          <el-form-item label="规格名" prop="specification">
            <el-input v-model="specForm.specification" />
          </el-form-item>
          <el-form-item label="规格值" prop="value">
            <el-input v-model="specForm" />
          </el-form-item>
          <el-form-item label="规格图片" prop="picUrl">
            <el-upload
              :action="uploadPath"
              :show-file-list="false"
              :headers="headers"
              :on-success="uploadSpecPicUrl"
              class="avatar-uploader"
              accept=".jpg, .jpeg, .png, .gif"
            >
              <img v-if="specForm.picUrl" :src="specForm.picUrl" class="avatar">
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              <template #tip><div class="el-upload__tip">只能上传jpg、jpeg、png、gif文件，200 x 200</div></template>
            </el-upload>
          </el-form-item>
        </el-form>
        <template #footer><div class="dialog-footer">
          <el-button @click="specVisiable = false">取消</el-button>
          <el-button type="primary" @click="handleSpecificationAdd">确定</el-button>
        </div></template>
      </el-dialog>
    </el-card>

    <el-card class="box-card">
      <h3>商品库存</h3>
      <el-table border :data="products">
        <el-table-column property="value" label="货品规格">
          <template #default="scope">
            <el-tag v-for="tag in scope.row.specifications" :key="tag">{{ tag }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column property="price" width="100" label="货品售价" />
        <el-table-column property="number" width="100" label="货品数量" />
        <el-table-column property="defaultSelected" label="默认选中">
          <template #default="scope">
            <el-switch
              v-model="scope.row.defaultSelected"
              :active-value="true"
              :inactive-value="false"
              active-color="#13ce66"
              inactive-color="#ff4949"
            />
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="操作"
          width="100"
          class-name="small-padding fixed-width"
        >
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleProductShow(scope.row)">设置</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog v-model="productVisiable" title="添加货品">
        <el-form
          ref="productFormRef"
          :model="productForm"
          status-icon
          label-position="left"
          label-width="100px"
          style="width: 400px; margin-left:50px;"
        >
          <el-form-item label="货品规格列" prop="specifications">
            <el-tag v-for="tag in productForm.specifications" :key="tag">{{ tag }}</el-tag>
          </el-form-item>
          <el-form-item label="货品售价" prop="price">
            <el-input v-model="productForm.price" />
          </el-form-item>
          <el-form-item label="货品数量" prop="number">
            <el-input v-model="productForm.number" />
          </el-form-item>
        </el-form>
        <template #footer><div class="dialog-footer">
          <el-button @click="productVisiable = false">取消</el-button>
          <el-button type="primary" @click="handleProductEdit">确定</el-button>
        </div></template>
      </el-dialog>
    </el-card>

    <el-card class="box-card">
      <h3>商品参数</h3>
      <el-button type="primary" @click="handleAttributeShow">添加</el-button>
      <el-table border :data="attributes">
        <el-table-column property="attribute" label="商品参数名称" />
        <el-table-column property="value" label="商品参数值" />
        <el-table-column
          align="center"
          label="操作"
          width="100"
          class-name="small-padding fixed-width"
        >
          <template #default="scope">
            <el-button type="danger" size="small" @click="handleAttributeDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog v-model="attributeVisiable" title="添加商品参数">
        <el-form
          ref="attributeFormRef"
          :model="attributeForm"
          status-icon
          label-position="left"
          label-width="100px"
          style="width: 400px; margin-left:50px;"
        >
          <el-form-item label="商品参数名称" prop="attribute">
            <el-input v-model="attributeForm.attribute" />
          </el-form-item>
          <el-form-item label="商品参数值" prop="value">
            <el-input v-model="attributeForm" />
          </el-form-item>
        </el-form>
        <template #footer><div class="dialog-footer">
          <el-button @click="attributeVisiable = false">取消</el-button>
          <el-button type="primary" @click="handleAttributeAdd">确定</el-button>
        </div></template>
      </el-dialog>
    </el-card>

    <div class="op-container">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handlePublish">上架</el-button>
    </div>
  </div>
</template>

<script setup>
import { getCurrentInstance, nextTick, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { addGoods } from '@/api/shop/goods'
import { listCategory } from '@/api/shop/category'
import Editor from '@/utils/tinymce-editor'
import { getToken } from '@/utils/auth'
import { uploadPath as uploadApiPath, fileUpload } from '@/api/upload'
import { createTinymceImageUploadHandler, createTinymceInit, tinymceLicenseKey as tinyMceGplLicenseKey } from '@/utils/tinymce'
import { useTemplateRefs } from '@/utils/templateRefs'
const instance = getCurrentInstance()
const router = useRouter()
const route = useRoute()
defineOptions({
  name: 'GoodsCreate',
  components: {
    Editor
  }
})
const templateRefs = useTemplateRefs(instance)
const newKeywordVisible = ref(false)
const newKeyword = ref('')
const keywords = ref([])
const categoryList = ref([])
const props = ref({
  label: 'name',
  value: 'id',
  expandTrigger: 'hover'
})
const goods = ref({
  picUrl: '',
  gallery: [],
  isHot: false,
  isNew: true,
  isOnSale: true
})
const specVisiable = ref(false)
const specForm = ref({
  specification: '',
  value: '',
  picUrl: ''
})
const multipleSpec = ref(false)
const specifications = ref([{
  specification: '规格',
  value: '标准',
  picUrl: ''
}])
const productVisiable = ref(false)
const productForm = ref({
  id: 0,
  specifications: [],
  price: 0.0,
  number: 0,
  url: ''
})
const products = ref([{
  id: 0,
  specifications: ['标准'],
  price: 0.0,
  defaultSelected: true,
  number: 0,
  url: ''
}])
const attributeVisiable = ref(false)
const attributeForm = ref({
  attribute: '',
  value: ''
})
const attributes = ref([])
const tinymceLicenseKey = ref(tinyMceGplLicenseKey)
const rules = ref({
  name: [{
    required: true,
    message: '商品名称不能为空',
    trigger: 'blur'
  }],
  unit: [{
    required: true,
    message: '商品单位不能为空',
    trigger: 'blur'
  }],
  categoryId: [{
    required: true,
    message: '商品分类不能为空',
    trigger: 'blur'
  }]
})
const editorInit = ref(createTinymceInit({
  images_upload_handler: createTinymceImageUploadHandler(fileUpload, res => res.data)
}))
const uploadPath = ref(uploadApiPath)
const headers = ref({
  Authorization: 'Bearer ' + getToken()
})
function init() {
  getCategoryList()
}
async function getCategoryList() {
  const {
    data
  } = await listCategory()
  categoryList.value = instance.proxy.buildTree(data, 'id', 'pid')
}
function handleCategoryChange(value) {
  goods.value.categoryId = value[value.length - 1]
}
function handleCancel() {
  router.push({
    path: '/shop/goods',
    query: {
      pageNum: route.query.pageNum
    }
  })
}
function handlePublish() {
  const finalGoods = {
    goods: goods.value,
    specifications: specifications.value,
    products: products.value,
    attributes: attributes.value
  }
  templateRefs.goodsFormRef.validate((valid, field) => {
    if (valid) {
      addGoods(finalGoods).then(response => {
        instance.proxy.$message.success({
          title: '成功',
          message: '创建成功'
        })
        router.push({
          path: '/shop/goods',
          query: {
            pageNum: route.query.pageNum
          }
        })
      }).catch(function(e) {})
    } else {
      instance.proxy.showErrorfocus()
    }
  })
}
function handleClose(tag) {
  keywords.value.splice(keywords.value.indexOf(tag), 1)
  goods.value.keywords = keywords.value.toString()
}
function showInput() {
  newKeywordVisible.value = true
  nextTick(_ => {
    templateRefs.newKeywordInput.$refs.input.focus()
  })
}
function handleInputConfirm() {
  const keyword = newKeyword.value
  if (keyword) {
    keywords.value.push(keyword)
    goods.value.keywords = keywords.value.toString()
  }
  newKeywordVisible.value = false
  newKeyword.value = ''
}
function uploadPicUrl(response) {
  if (response.code === 200) {
    goods.value.picUrl = response.data
  }
}
function uploadOverrun() {
  instance.proxy.$message({
    type: 'error',
    message: '上传文件个数超出限制!最多上传5张图片!'
  })
}
function handleGalleryUrl(response, file, fileList) {
  if (response.code === 200) {
    goods.value.gallery.push(response.data)
  }
}
function handleRemove(file, fileList) {
  for (let i = 0; i < goods.value.gallery.length; i++) {
    // 这里存在两种情况
    // 1. 如果所删除图片是刚刚上传的图片，那么图片地址是file.response.data.url
    //    此时的file.url虽然存在，但是是本机地址，而不是远程地址。
    // 2. 如果所删除图片是后台返回的已有图片，那么图片地址是file.url
    let url
    if (file.response === undefined) {
      url = file.url
    } else {
      url = file.response.data
    }
    if (goods.value.gallery[i] === url) {
      goods.value.gallery.splice(i, 1)
    }
  }
}
function specChanged(label) {
  if (label === false) {
    specifications.value = [{
      specification: '规格',
      value: '标准',
      picUrl: ''
    }]
    products.value = [{
      id: 0,
      specifications: ['标准'],
      price: 0.0,
      defaultSelected: true,
      number: 0,
      url: ''
    }]
  } else {
    specifications.value = []
    products.value = []
  }
}
function uploadSpecPicUrl(response) {
  if (response.code === 200) {
    specForm.value.picUrl = response.data
  }
}
function handleSpecificationShow() {
  specForm.value = {
    specification: '',
    value: '',
    picUrl: ''
  }
  specVisiable.value = true
}
function handleSpecificationAdd() {
  let index = specifications.value.length - 1
  for (let i = 0; i < specifications.value.length; i++) {
    const v = specifications.value[i]
    if (v.specification === specForm.value.specification) {
      if (v.value === specForm.value.value) {
        instance.proxy.$message({
          type: 'warning',
          message: '已经存在规格值:' + v.value
        })
        specForm.value = {}
        specVisiable.value = false
        return
      } else {
        index = i
      }
    }
  }
  specifications.value.splice(index + 1, 0, specForm.value)
  specVisiable.value = false
  specToProduct()
}
function handleSpecificationDelete(row) {
  const index = specifications.value.indexOf(row)
  specifications.value.splice(index, 1)
  specToProduct()
}
function specToProduct() {
  if (specifications.value.length === 0) {
    return
  }
  // 根据specifications创建临时规格列表
  const specValues = []
  let spec = specifications.value[0].specification
  let values = []
  values.push(0)
  for (let i = 1; i < specifications.value.length; i++) {
    const aspec = specifications.value[i].specification
    if (aspec === spec) {
      values.push(i)
    } else {
      specValues.push(values)
      spec = aspec
      values = []
      values.push(i)
    }
  }
  specValues.push(values)

  // 根据临时规格列表生产货品规格
  // 算法基于 https://blog.csdn.net/tyhj_sf/article/details/53893125
  let productsIndex = 0
  const generatedProducts = []
  const combination = []
  const n = specValues.length
  for (let s = 0; s < n; s++) {
    combination[s] = 0
  }
  let index = 0
  let isContinue = false
  do {
    const productSpecifications = []
    for (let x = 0; x < n; x++) {
      const z = specValues[x][combination[x]]
      productSpecifications.push(specifications.value[z].value)
    }
    generatedProducts[productsIndex] = {
      id: productsIndex,
      specifications: productSpecifications,
      price: 0.0,
      number: 0,
      url: ''
    }
    productsIndex++
    index++
    combination[n - 1] = index
    for (let j = n - 1; j >= 0; j--) {
      if (combination[j] >= specValues[j].length) {
        combination[j] = 0
        index = 0
        if (j - 1 >= 0) {
          combination[j - 1] = combination[j - 1] + 1
        }
      }
    }
    isContinue = false
    for (let p = 0; p < n; p++) {
      if (combination[p] !== 0) {
        isContinue = true
      }
    }
  } while (isContinue)
  products.value = generatedProducts
}
function handleProductShow(row) {
  productForm.value = Object.assign({}, row)
  productVisiable.value = true
}
function uploadProductUrl(response) {
  if (response.code === 200) {
    productForm.value.url = response.data
  }
}
function handleProductEdit() {
  for (let i = 0; i < products.value.length; i++) {
    const v = products.value[i]
    if (v.id === productForm.value.id) {
      products.value.splice(i, 1, productForm.value)
      break
    }
  }
  productVisiable.value = false
}
function handleAttributeShow() {
  attributeForm.value = {}
  attributeVisiable.value = true
}
function handleAttributeAdd() {
  attributes.value.unshift(attributeForm.value)
  attributeVisiable.value = false
}
function handleAttributeDelete(row) {
  const index = attributes.value.indexOf(row)
  attributes.value.splice(index, 1)
}
function handleSwitchChange(row) {
  const text = row.defaultSelected === true ? '启用' : '停用'
  instance.proxy.$confirm('确认要 "' + text + '"' + row.specification + '规格吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function() {
    // return changeUserStatus(row.userId, row.userStatus)
  }).then(() => {
    instance.proxy.$message.success(text + '成功')
  }).catch(function() {
    row.defaultSelected = !row.defaultSelected
  })
}
(() => {
  init()
})()
defineExpose({
  attributeForm,
  attributeVisiable,
  attributes,
  categoryList,
  editorInit,
  getCategoryList,
  goods,
  handleAttributeAdd,
  handleAttributeDelete,
  handleAttributeShow,
  handleCancel,
  handleCategoryChange,
  handleClose,
  handleGalleryUrl,
  handleInputConfirm,
  handleProductEdit,
  handleProductShow,
  handlePublish,
  handleRemove,
  handleSpecificationAdd,
  handleSpecificationDelete,
  handleSpecificationShow,
  handleSwitchChange,
  headers,
  init,
  keywords,
  multipleSpec,
  newKeyword,
  newKeywordVisible,
  productForm,
  productVisiable,
  products,
  props,
  rules,
  showInput,
  specChanged,
  specForm,
  specToProduct,
  specVisiable,
  specifications,
  tinymceLicenseKey,
  uploadOverrun,
  uploadPath,
  uploadPicUrl,
  uploadProductUrl,
  uploadSpecPicUrl
})
</script>
<style scoped>
.el-card {
  margin-bottom: 10px;
}

.el-tag + .el-tag {
  margin-left: 10px;
}

.input-new-keyword {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
.op-container {
  display: flex;
  justify-content: center;
}
</style>
