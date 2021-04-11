<template>
  <div class="app-container">
    <el-card class="box-card">
      <h3>商品介绍</h3>
      <el-form ref="goods" :rules="rules" :model="goods" label-width="150px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="goods.name" />
        </el-form-item>
        <el-form-item label="市场售价" prop="counterPrice">
          <el-input v-model="goods.counterPrice" placeholder="0.00">
            <template slot="append">元</template>
          </el-input>
        </el-form-item>
        <el-form-item label="是否新品" prop="isNew">
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
        </el-form-item>
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
            <i v-else class="el-icon-plus avatar-uploader-icon" />
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
            <i class="el-icon-plus" />
          </el-upload>
        </el-form-item>

        <el-form-item label="商品单位" prop="unit">
          <el-input v-model="goods.unit" placeholder="件 / 个 / 盒" />
        </el-form-item>

        <el-form-item label="销量">
          <el-input
            v-model="goods.virtualSales"
            placeholder=""
          ><template slot="append">{{ goods.unit }}</template>
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
            @keyup.enter.native="handleInputConfirm"
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
          <editor v-model="goods.detail" :init="editorInit" />
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
          <template slot-scope="scope">
            <el-tag type="primary">{{ scope.row.value }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column property="picUrl" label="规格图片">
          <template slot-scope="scope">
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
          <template slot-scope="scope">
            <el-button type="danger" size="mini" @click="handleSpecificationDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog :visible.sync="specVisiable" title="设置规格">
        <el-form
          ref="specForm"
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
            <el-input v-model="specForm.value" />
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
              <i v-else class="el-icon-plus avatar-uploader-icon" />
            </el-upload>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="specVisiable = false">取消</el-button>
          <el-button type="primary" @click="handleSpecificationAdd">确定</el-button>
        </div>
      </el-dialog>
    </el-card>

    <el-card class="box-card">
      <h3>商品库存</h3>
      <el-table border :data="products">
        <el-table-column property="value" label="货品规格">
          <template slot-scope="scope">
            <el-tag v-for="tag in scope.row.specifications" :key="tag">{{ tag }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column property="price" width="100" label="货品售价" />
        <el-table-column property="number" width="100" label="货品数量" />
        <el-table-column property="url" width="100" label="货品图片">
          <template slot-scope="scope">
            <img v-if="scope.row.url" :src="scope.row.url" width="40">
          </template>
        </el-table-column>
        <el-table-column property="defaultSelected" label="默认选中">
          <template slot-scope="scope">
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
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="handleProductShow(scope.row)">设置</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog :visible.sync="productVisiable" title="添加货品">
        <el-form
          ref="productForm"
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
          <el-form-item label="货品图片" prop="url">
            <el-upload
              :action="uploadPath"
              :show-file-list="false"
              :headers="headers"
              :on-success="uploadProductUrl"
              class="avatar-uploader"
              accept=".jpg, .jpeg, .png, .gif"
            >
              <img v-if="productForm.url" :src="productForm.url" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon" />
            </el-upload>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="productVisiable = false">取消</el-button>
          <el-button type="primary" @click="handleProductEdit">确定</el-button>
        </div>
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
          <template slot-scope="scope">
            <el-button type="danger" size="mini" @click="handleAttributeDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog :visible.sync="attributeVisiable" title="添加商品参数">
        <el-form
          ref="attributeForm"
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
            <el-input v-model="attributeForm.value" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="attributeVisiable = false">取消</el-button>
          <el-button type="primary" @click="handleAttributeAdd">确定</el-button>
        </div>
      </el-dialog>
    </el-card>

    <div class="op-container">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handlePublish">上架</el-button>
    </div>
  </div>
</template>

<script>
import { addGoods } from '@/api/shop/goods'
import { listCategory } from '@/api/shop/category'
import Editor from '@tinymce/tinymce-vue'
import { getToken } from '@/utils/auth'
import { uploadPath, fileUpload } from '@/api/upload'

export default {
  name: 'GoodsCreate',
  components: { Editor },
  data() {
    return {
      newKeywordVisible: false,
      newKeyword: '',
      // 商品关键词
      keywords: [],
      // 商品列表
      categoryList: [],
      // el-cascader’s props
      props: { label: 'name', value: 'id', expandTrigger: 'hover' },
      // brandList: [],
      // 商品表单参数
      goods: {
        picUrl: '',
        gallery: [],
        isHot: false,
        isNew: true,
        isOnSale: true
      },
      // 是否显示规格弹出层
      specVisiable: false,
      // 规格表单参数
      specForm: { specification: '', value: '', picUrl: '' },
      multipleSpec: false,
      // 规格数组
      specifications: [
        {
          specification: '规格',
          value: '标准',
          picUrl: ''
        }
      ],
      // 是否显示货品弹出层
      productVisiable: false,
      // 货品表单参数
      productForm: {
        id: 0,
        specifications: [],
        price: 0.0,
        number: 0,
        url: ''
      },
      // 货品数组
      products: [
        {
          id: 0,
          specifications: ['标准'],
          price: 0.0,
          defaultSelected: true,
          number: 0,
          url: ''
        }
      ],
      // 是否显示属性弹出层
      attributeVisiable: false,
      // 属性表单参数
      attributeForm: { attribute: '', value: '' },
      // 属性数组
      attributes: [],
      // 表单校验
      rules: {
        name: [
          { required: true, message: '商品名称不能为空', trigger: 'blur' }
        ],
        unit: [
          { required: true, message: '商品单位不能为空', trigger: 'blur' }
        ],
        categoryId: [
          { required: true, message: '商品分类不能为空', trigger: 'blur' }
        ]
      },
      // 初始化富文本编辑器
      editorInit: {
        language: 'zh_CN',
        height: 500,
        convert_urls: false,
        plugins: [
          'advlist anchor autolink autosave code codesample  directionality emoticons fullscreen hr image imagetools importcss insertdatetime link lists media nonbreaking noneditable pagebreak paste preview print save searchreplace spellchecker tabfocus table template textpattern visualblocks visualchars wordcount'
        ],
        toolbar: [
          'searchreplace bold italic underline strikethrough alignleft aligncenter alignright outdent indent  blockquote undo redo removeformat subscript superscript code codesample',
          'hr bullist numlist link image charmap preview anchor pagebreak insertdatetime media table emoticons forecolor backcolor fullscreen'
        ],
        images_upload_handler: function(blobInfo, success, failure) {
          const formData = new FormData()
          formData.append('file', blobInfo.blob())
          fileUpload(formData)
            .then((res) => {
              success(res.map.url)
            })
            .catch(() => {
              failure('上传失败，请重新上传')
            })
        }
      },
      // 上传文件路径
      uploadPath,
      // 上传路径header设置
      headers: { Authorization: 'Bearer ' + getToken() }
    }
  },
  created() {
    this.init()
  },

  methods: {
    // 初始化
    init: function() {
      this.getCategoryList()
    },
    // 获取商品分类
    async getCategoryList() {
      const {
        map: { data }
      } = await listCategory()
      this.categoryList = this.buildTree(data, 'id', 'pid')
    },
    // 更改商品所属分类
    handleCategoryChange(value) {
      this.goods.categoryId = value[value.length - 1]
    },
    // 关闭当前页面
    handleCancel: function() {
      this.$router.push({ path: '/shop/goods' })
    },
    // 上架商品
    handlePublish: function() {
      const finalGoods = {
        goods: this.goods,
        specifications: this.specifications,
        products: this.products,
        attributes: this.attributes
      }
      this.$refs['goods'].validate((valid, field) => {
        if (valid) {
          addGoods(finalGoods)
            .then((response) => {
              this.$message.success({
                title: '成功',
                message: '创建成功'
              })
              this.$router.push({ path: '/shop/goods' })
            })
            .catch(function(e) {})
        } else {
          this.showErrorfocus()
        }
      })
    },
    // 关闭添加关键字标签
    handleClose(tag) {
      this.keywords.splice(this.keywords.indexOf(tag), 1)
      this.goods.keywords = this.keywords.toString()
    },
    // 添加关键字标签
    showInput() {
      this.newKeywordVisible = true
      this.$nextTick((_) => {
        this.$refs.newKeywordInput.$refs.input.focus()
      })
    },
    // 保存关键字
    handleInputConfirm() {
      const newKeyword = this.newKeyword
      if (newKeyword) {
        this.keywords.push(newKeyword)
        this.goods.keywords = this.keywords.toString()
      }
      this.newKeywordVisible = false
      this.newKeyword = ''
    },
    // 上传商品图片
    uploadPicUrl: function(response) {
      if (response.code === 200) {
        this.goods.picUrl = response.map.url
      }
    },
    uploadOverrun: function() {
      this.$message({
        type: 'error',
        message: '上传文件个数超出限制!最多上传5张图片!'
      })
    },
    // 上传商品画廊
    handleGalleryUrl(response, file, fileList) {
      if (response.code === 200) {
        this.goods.gallery.push(response.map.url)
      }
    },
    // 移除商品画廊
    handleRemove: function(file, fileList) {
      for (let i = 0; i < this.goods.gallery.length; i++) {
        // 这里存在两种情况
        // 1. 如果所删除图片是刚刚上传的图片，那么图片地址是file.response.data.url
        //    此时的file.url虽然存在，但是是本机地址，而不是远程地址。
        // 2. 如果所删除图片是后台返回的已有图片，那么图片地址是file.url
        let url
        if (file.response === undefined) {
          url = file.url
        } else {
          url = file.response.data.url
        }

        if (this.goods.gallery[i] === url) {
          this.goods.gallery.splice(i, 1)
        }
      }
    },
    // 更改商品规格
    specChanged: function(label) {
      if (label === false) {
        this.specifications = [
          {
            specification: '规格',
            value: '标准',
            picUrl: ''
          }
        ]
        this.products = [
          {
            id: 0,
            specifications: ['标准'],
            price: 0.0,
            defaultSelected: true,
            number: 0,
            url: ''
          }
        ]
      } else {
        this.specifications = []
        this.products = []
      }
    },
    // 上传规格图片
    uploadSpecPicUrl: function(response) {
      if (response.code === 200) {
        this.specForm.picUrl = response.map.url
      }
    },
    // 显示规格弹出层
    handleSpecificationShow() {
      this.specForm = { specification: '', value: '', picUrl: '' }
      this.specVisiable = true
    },
    // 保存规格
    handleSpecificationAdd() {
      let index = this.specifications.length - 1
      for (let i = 0; i < this.specifications.length; i++) {
        const v = this.specifications[i]
        if (v.specification === this.specForm.specification) {
          if (v.value === this.specForm.value) {
            this.$message({
              type: 'warning',
              message: '已经存在规格值:' + v.value
            })
            this.specForm = {}
            this.specVisiable = false
            return
          } else {
            index = i
          }
        }
      }

      this.specifications.splice(index + 1, 0, this.specForm)
      this.specVisiable = false
      this.specToProduct()
    },
    // 删除规格
    handleSpecificationDelete(row) {
      const index = this.specifications.indexOf(row)
      this.specifications.splice(index, 1)
      this.specToProduct()
    },
    // 规格关联货品
    specToProduct() {
      if (this.specifications.length === 0) {
        return
      }
      // 根据specifications创建临时规格列表
      const specValues = []
      let spec = this.specifications[0].specification
      let values = []
      values.push(0)

      for (let i = 1; i < this.specifications.length; i++) {
        const aspec = this.specifications[i].specification

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
      const products = []
      const combination = []
      const n = specValues.length
      for (let s = 0; s < n; s++) {
        combination[s] = 0
      }
      let index = 0
      let isContinue = false
      do {
        const specifications = []
        for (let x = 0; x < n; x++) {
          const z = specValues[x][combination[x]]
          specifications.push(this.specifications[z].value)
        }
        products[productsIndex] = {
          id: productsIndex,
          specifications: specifications,
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

      this.products = products
    },
    // 显示货品弹出层
    handleProductShow(row) {
      this.productForm = Object.assign({}, row)
      this.productVisiable = true
    },
    // 上传货品图片
    uploadProductUrl: function(response) {
      if (response.code === 200) {
        this.productForm.url = response.map.url
      }
    },
    // 保存货品
    handleProductEdit() {
      for (let i = 0; i < this.products.length; i++) {
        const v = this.products[i]
        if (v.id === this.productForm.id) {
          this.products.splice(i, 1, this.productForm)
          break
        }
      }
      this.productVisiable = false
    },
    // 显示属性弹出层
    handleAttributeShow() {
      this.attributeForm = {}
      this.attributeVisiable = true
    },
    // 保存属性
    handleAttributeAdd() {
      this.attributes.unshift(this.attributeForm)
      this.attributeVisiable = false
    },
    // 删除属性
    handleAttributeDelete(row) {
      const index = this.attributes.indexOf(row)
      this.attributes.splice(index, 1)
    },
    /**
     * switch 状态发生变化时的回调函数
     */
    handleSwitchChange(row) {
      const text = row.defaultSelected === true ? '启用' : '停用'
      this.$confirm(
        '确认要 "' + text + '"' + row.specification + '规格吗?',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          // return changeUserStatus(row.userId, row.userStatus)
        })
        .then(() => {
          this.$message.success(text + '成功')
        })
        .catch(function() {
          row.defaultSelected = !row.defaultSelected
        })
    }
  }
}
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
