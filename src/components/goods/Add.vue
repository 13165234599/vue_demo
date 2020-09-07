<template>
  <div>
    <!-- 面包屑列表 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片试图区域 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
      <!-- 步骤条 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab栏 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTableLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb,i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              :prop="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :on-success="handleSuccess"
              :headers="headerObj"
              class="upload-demo"
              action="http://127.0.0.1:8888/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce">
            </quill-editor>
             <el-button type="primary" class="quillbutton" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="PicDialogVisible" width="50%">
      <img :src="previewPath" class="previewPathimg">
    </el-dialog>
  </div>
</template>
<script>
import _ from 'lodash'
export default {
  data() {
    return {
      activeIndex: "0",
      // 添加商品的表单数据对象
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        //商品所属大的分类数组
        goods_cat: [],
        //图片的数组
        pics: [],
        //商品的详情描述
        goods_introduce: '',
        attrs: []
      },
      // 表单验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
        ],
        goods_cat: [
          { required: true, message: "请选择商品分类", trigger: "blur" },
        ],
      },
      // 数据列表
      cateList: [],
      cateProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      // 动态数据列表数据
      manyTableData: [],
      // 静态数据列表数据
      onlyTableData: [],
      // 图片上传组件的header请求
      headerObj: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      // 预览属性
      previewPath: "",
      // 显示图片框的显示与隐藏
      PicDialogVisible: false
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 获取数据列表
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取数据列表失败");
      }
      this.cateList = res.data;
      console.log(this.cateList);
    },
    // 级联选择器改变时，触发以下函数
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
      }
    },
    beforeTableLeave(activeName, oldActiveName) {
      if (this.addForm.goods_cat.length !== 3 && oldActiveName == "0") {
        this.$message.error("请选择商品分类");
        return false;
      }
    },
    async tabClicked() {
      // 当activeIndex==='1',证明选中了动态参数面板
      if (this.activeIndex === "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "many" },
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取参数列表失败");
        }
        // return this.$message.success('获取参数列表成功')
        console.log(res.data, "sss");
        // 分离attr_vals
        res.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ");
        });
        this.manyTableData = res.data;
      } else if (this.activeIndex === "2") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "only" },
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取参数列表失败");
        }
        console.log(res.data);
        this.onlyTableData = res.data;
      }
    },
    // 预览图片
    handlePreview(file) {
      console.log(file);
      this.previewPath = file.response.data.url;
      this.PicDialogVisible = true
    },
    // 删除图片
    handleRemove(file) {
      // console.log(file)
      // 1,获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path;
      // 2 从pics数组中，找到这个图片对应的索引值
      const i = this.addForm.pics.findIndex((x) => x.pic === filePath);
      //3 调用数组的splice方法，把图片信息对象，从pics数组中移除
      this.addForm.pics.splice(i, 1);
      console.log(this.addForm);
    },
    handleSuccess(response) {
      console.log(response);
      //1 拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path };
      //2 将图片信息对象，push 到pics数组中
      this.addForm.pics.push(picInfo);
      // console.log(this.addForm,'fff');
    },
    addGoods() {
      console.log(this.addForm);
      this.$refs.addFormRef.validate( async valid =>{
        if(!valid) {
          return this.$message.error('请填写必要的表单项')
        }
        //直接用以下方法会报错
        // this.addForm.goods_cat = this.addForm.goods_cat.join(',')
        // 要先用lodash 深拷贝cloneDeep（obj）
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        //处理动态参数
        this.manyTableData.forEach(item => {
         const newInfo = {attr_id: item.attr_id,
          attr_value: item.attr_vals.join(' ')}
         this.addForm.attrs.push(newInfo) 
        })
        //处理静态参数
        this.onlyTableData.forEach(item =>{
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        console.log(form);
        const {data:res} = await this.$http.post('goods',form)
        if(res.meta.status !==201){
          return this.$message.error('添加商品失败')
        }
        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2];
      }
      return false;
    },
  },
};
</script>

<style lang="less" scoped>
.el-checkbox {
  margin-right: 10px;
}
.previewPathimg {
  width: 100%;
}
.quillbutton {
  margin-top: 16px;

}

</style>