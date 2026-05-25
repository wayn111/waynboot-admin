<template>
  <div class="app-container">
    <el-card class="box-card">
      <h3>商品介绍</h3>
      <el-form ref="goodsFormRef" :rules="rules" :model="goods" label-width="150px">
        <el-form-item label="商品ID" prop="id">
          <el-input v-model="goods.id" disabled />
        </el-form-item>
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="goods.name" />
        </el-form-item>
        <el-form-item label="商品编号" prop="goodsSn">
          <el-input v-model="goods.goodsSn" disabled />
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
            :headers="headers"
            :action="uploadPath"
            :show-file-list="false"
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
            :headers="headers"
            :limit="5"
            :file-list="galleryFileList"
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

        <el-form-item label="商品单位">
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
          <el-button
            v-else
            class="button-new-keyword"
            type="primary"
            @click="showInput"
          >+ 增加</el-button>
        </el-form-item>

        <el-form-item label="所属分类">
          <el-cascader
            v-model="categoryIds"
            :options="categoryList"
            :props="props"
            clearable
            expand-trigger="hover"
            @change="handleCategoryChange"
          />
        </el-form-item>

        <!-- <el-form-item label="所属品牌商">
          <el-select v-model="goods.brandId" clearable>
            <el-option v-for="item in brandList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>-->

        <el-form-item label="商品简介">
          <el-input v-model="goods.brief" />
        </el-form-item>

        <el-form-item label="商品详细介绍">
          <editor
            v-if="goodsLoaded"
            :key="goods.id || 'goods-detail-editor'"
            v-model="goods.detail"
            :init="editorInit"
            :license-key="tinymceLicenseKey"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="box-card">
      <h3>商品规格</h3>
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
          align="center"
          label="操作"
          width="200"
          class-name="small-padding fixed-width"
        >
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="handleSpecificationShow(scope.row)"
            >设置</el-button>
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
          style="width: 400px; margin-left: 50px"
        >
          <el-form-item label="规格名" prop="specification">
            <el-input v-model="specForm.specification" disabled />
          </el-form-item>
          <el-form-item label="规格值" prop="value">
            <el-input v-model="specForm" disabled />
          </el-form-item>
          <el-form-item label="规格图片" prop="picUrl">
            <el-upload
              :headers="headers"
              :action="uploadPath"
              :show-file-list="false"
              :on-success="uploadSpecPicUrl"
              class="avatar-uploader"
              accept=".jpg, .jpeg, .png, .gif"
            >
              <img
                v-if="specForm.picUrl"
                :src="specForm.picUrl"
                class="avatar"
              >
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              <template #tip><div class="el-upload__tip">只能上传jpg、jpeg、png、gif文件，200 x 200</div></template>
            </el-upload>
          </el-form-item>
        </el-form>
        <template #footer><div class="dialog-footer">
          <el-button @click="specVisiable = false">取消</el-button>
          <el-button
            type="primary"
            @click="handleSpecificationEdit"
          >确定</el-button>
        </div></template>
      </el-dialog>
    </el-card>

    <el-card class="box-card">
      <h3>商品库存</h3>
      <el-table border :data="products">
        <el-table-column property="value" label="货品规格">
          <template #default="scope">
            <el-tag v-for="tag in scope.row.specifications" :key="tag">{{
              tag
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column property="price" label="货品售价" />
        <el-table-column property="number" label="货品数量" />
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
          width="200"
          class-name="small-padding fixed-width"
        >
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="handleProductShow(scope.row)"
            >设置</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog v-model="productVisiable" title="编辑货品">
        <el-form
          ref="productFormRef"
          :model="productForm"
          status-icon
          label-position="left"
          label-width="100px"
          style="width: 400px; margin-left: 50px"
        >
          <el-form-item label="货品规格列" prop="specifications">
            <el-tag v-for="tag in productForm.specifications" :key="tag">{{
              tag
            }}</el-tag>
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
      <el-table border :data="attributesData">
        <el-table-column property="attribute" label="商品参数名称" />
        <el-table-column property="value" label="商品参数值" />
        <el-table-column
          align="center"
          label="操作"
          width="200"
          class-name="small-padding fixed-width"
        >
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="handleAttributeShow(scope.row)"
            >设置</el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleAttributeDelete(scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog
        v-model="attributeVisiable"
        :title="attributeAdd ? '添加商品参数' : '编辑商品参数'"
      >
        <el-form
          ref="attributeFormRef"
          :model="attributeForm"
          status-icon
          label-position="left"
          label-width="100px"
          style="width: 400px; margin-left: 50px"
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
          <el-button
            v-if="attributeAdd"
            type="primary"
            @click="handleAttributeAdd"
          >确定</el-button>
          <el-button
            v-else
            type="primary"
            @click="handleAttributeEdit"
          >确定</el-button>
        </div></template>
      </el-dialog>
    </el-card>

    <div class="op-container">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleEdit">更新商品</el-button>
    </div>
  </div>
</template>
<script setup>
import { computed, getCurrentInstance, nextTick, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getGoods, updateGoods } from '@/api/shop/goods'
import { listCategory } from '@/api/shop/category'
import Editor from '@/utils/tinymce-editor'
import { getToken } from '@/utils/auth'
import { uploadPath as uploadApiPath, fileUpload } from '@/api/upload'
import { createTinymceImageUploadHandler, createTinymceInit, tinymceLicenseKey as tinyMceGplLicenseKey } from '@/utils/tinymce'
import { useTemplateRefs } from '@/utils/templateRefs'
const instance = getCurrentInstance()
const router = instance.appContext.config.globalProperties.$router || useRouter()
const route = instance.appContext.config.globalProperties.$route || useRoute() || { query: {}}
defineOptions({
  name: 'GoodsEdit',
  components: {
    Editor
  }
})
const templateRefs = useTemplateRefs(instance)
const newKeywordVisible = ref(false)
const newKeyword = ref('')
const keywords = ref([])
const galleryFileList = ref([])
const categoryList = ref([])
const props = ref({
  label: 'name',
  value: 'id',
  expandTrigger: 'hover'
})
const categoryIds = ref([])
const goodsLoaded = ref(false)
const goods = reactive({
  gallery: [],
  detail: ''
})
const specVisiable = ref(false)
const specForm = ref({
  specification: '',
  value: '',
  picUrl: ''
})
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
const attributeAdd = ref(true)
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
  }]
})
const editorInit = ref(createTinymceInit({
  height: '400px',
  images_upload_handler: createTinymceImageUploadHandler(fileUpload, res => res.data)
}))
const uploadPath = ref(uploadApiPath)
const headers = ref({
  Authorization: 'Bearer ' + getToken()
})
const attributesData = computed(() => {
  var attributesData = []
  for (var i = 0; i < attributes.value.length; i++) {
    if (attributes.value[i].deleted) {
      continue
    }
    attributesData.push(attributes.value[i])
  }
  return attributesData
})
function init() {
  if (route.query.id == null) {
    return
  }
  goodsLoaded.value = false
  const goodsId = route.query.id
  getGoods(goodsId).then(response => {
    const data = response.data
    const loadedGoods = {
      gallery: [],
      detail: '',
      ...data.goods
    }
    loadedGoods.gallery = loadedGoods.gallery || []
    loadedGoods.detail = loadedGoods.detail || ''
    Object.keys(goods).forEach(key => {
      delete goods[key]
    })
    Object.assign(goods, loadedGoods)
    // 稍微调整一下前后端不一致
    // if (this.goods.brandId === 0) {
    //   this.goods.brandId = null
    // }
    if (goods.keywords === '') {
      goods.keywords = null
    }
    specifications.value = data.specifications
    products.value = data.products
    attributes.value = data.attributes
    categoryIds.value = data.categoryIds
    galleryFileList.value = []
    for (var i = 0; i < goods.gallery.length; i++) {
      galleryFileList.value.push({
        url: goods.gallery[i]
      })
    }
    const loadedKeywords = goods.keywords
    if (loadedKeywords != null && loadedKeywords !== '') {
      keywords.value = loadedKeywords.split(',')
    }
    goodsLoaded.value = true
  })
  getCategoryList()
}
watch(
  () => route.query.id,
  (id, oldId) => {
    if (id && id !== oldId) {
      init()
    }
  }
)
async function getCategoryList() {
  const {
    data
  } = await listCategory()
  categoryList.value = instance.proxy.buildTree(data, 'id', 'pid')
}
function handleCategoryChange(value) {
  goods.categoryId = value[value.length - 1]
}
function handleCancel() {
  router.push({
    path: '/shop/goods',
    query: {
      pageNum: route.query.pageNum
    }
  })
}
function handleEdit() {
  const finalGoods = {
    goods,
    specifications: specifications.value,
    products: products.value,
    attributes: attributes.value
  }
  templateRefs.goodsFormRef.validate((valid, field) => {
    if (valid) {
      updateGoods(finalGoods).then(response => {
        instance.proxy.$message.success({
          title: '成功',
          message: '编辑成功'
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
  goods.keywords = keywords.value.toString()
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
    goods.keywords = keywords.value.toString()
  }
  newKeywordVisible.value = false
  newKeyword.value = ''
}
function uploadPicUrl(response) {
  if (response.code === 200) {
    goods.picUrl = response.data
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
    goods.gallery.push(response.data)
  }
}
function handleRemove(file, fileList) {
  for (var i = 0; i < goods.gallery.length; i++) {
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
    if (goods.gallery[i] === url) {
      goods.gallery.splice(i, 1)
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
function handleSpecificationShow(row) {
  specForm.value = Object.assign({}, row)
  specVisiable.value = true
}
function handleSpecificationEdit() {
  specForm.value.updateTime = ''
  for (var i = 0; i < specifications.value.length; i++) {
    const v = specifications.value[i]
    if (v.id === specForm.value.id) {
      specifications.value.splice(i, 1, specForm.value)
      break
    }
  }
  specVisiable.value = false
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
  productForm.value.updateTime = ''
  for (var i = 0; i < products.value.length; i++) {
    const v = products.value[i]
    if (v.id === productForm.value.id) {
      products.value.splice(i, 1, productForm.value)
      break
    }
  }
  productVisiable.value = false
}
function handleAttributeShow(row) {
  if (row.id) {
    attributeForm.value = Object.assign({}, row)
    attributeAdd.value = false
  } else {
    attributeForm.value = {}
    attributeAdd.value = true
  }
  attributeVisiable.value = true
}
function handleAttributeAdd() {
  attributes.value.unshift(attributeForm.value)
  attributeVisiable.value = false
}
function handleAttributeEdit() {
  // 这是一个trick，设置updateTime的值为空，告诉后端这个记录已编辑需要更新。
  attributeForm.value.updateTime = ''
  for (var i = 0; i < attributes.value.length; i++) {
    const v = attributes.value[i]
    if (v.id === attributeForm.value.id) {
      attributes.value.splice(i, 1, attributeForm.value)
      break
    }
  }
  attributeVisiable.value = false
}
function handleAttributeDelete(row) {
  row.deleted = true
}
(() => {
  init()
})()
defineExpose({
  attributeAdd,
  attributeForm,
  attributeVisiable,
  attributes,
  attributesData,
  categoryIds,
  categoryList,
  editorInit,
  galleryFileList,
  getCategoryList,
  goods,
  goodsLoaded,
  handleAttributeAdd,
  handleAttributeDelete,
  handleAttributeEdit,
  handleAttributeShow,
  handleCancel,
  handleCategoryChange,
  handleClose,
  handleEdit,
  handleGalleryUrl,
  handleInputConfirm,
  handleProductEdit,
  handleProductShow,
  handleRemove,
  handleSpecificationEdit,
  handleSpecificationShow,
  headers,
  init,
  keywords,
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
