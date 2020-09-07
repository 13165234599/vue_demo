<template>
  <div>
    <!-- 面包屑列表 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片试图区域 -->
    <el-card>
      <!-- 上方搜索输入框和添加商品按钮 -->
      <el-row :gutter="20">
        <!-- 左边输入框 -->
        <el-col :span="8">
          <el-input placeholder="请输入内容" clearable v-model="queryInfo.query" @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <!-- 右边添加按钮 -->
        <el-col :span="4">
          <el-button type="primary" @click="addGoodsPage">添加按钮</el-button>
        </el-col>
      </el-row>
      <!-- 下方表格数据 -->
      <el-table :data="goodsList" style="width: 100%" stripe border :highlight-current-row="false">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="100"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="80"></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="200">
          <template slot-scope="scope">{{scope.row.add_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialogVisible(scope.row.goods_id)"
            >编辑</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeById(scope.row.goods_id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 20]"
        :page-size="100"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>
    <!-- 点击编辑，显示编辑框 -->
    <el-dialog title="商品信息修改" :visible.sync="editDialogVisible" width="50%" @close="editFormClosed">
      <el-form
        :model="editForm"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="editForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price">
          <el-input v-model="editForm.goods_price" type="number"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input v-model="editForm.goods_weight" type="number"></el-input>
        </el-form-item>
        
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmEditForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品列表
      goodsList: [],
      // 查询到的数据
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 5,
      },
      // 商品的总数据
      total: 0,
      //控制编辑框的显示与隐藏
      editDialogVisible: false,
      // 根据id查询到的用户信息
      editForm: {
        // goods_name: '',
        // goods_price: '',
        // goods_weight: '',
        // goods_id:''
      },
    };
  },
  created() {
    this.getGoodsList();
  },
  methods: {
    // 获取商品列表数据
    async getGoodsList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.queryInfo,
      });
      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品列表失败");
      }
      this.$message.success("获取商品列表成功");
      this.goodsList = res.data.goods;
      this.total = res.data.total;
    },
    // 每页多少条数据
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize;
      this.getGoodsList();
    },
    // 当前是多少页
    handleCurrentChange(newpage) {
      this.queryInfo.pagenum = newpage;
      this.getGoodsList();
    },
    // 删除商品
    removeById(goods_id) {
      this.$confirm("此操作将永久删除该商品, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.$http
            .delete(`goods/${goods_id}`)
            .then((res) => {
              console.log(res, "aaa");
              if (res.status == 200 && res.data.meta.status == 200) {
                this.$message({
                  type: "success",
                  message: "删除成功!",
                });
              }
              this.getGoodsList();
            })
            .catch(() => {
              this.$message({
                type: "info",
                message: "删除失败",
              });
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    // 跳转到添加商品页面
    addGoodsPage() {
      this.$router.push("/goods/add");
    },
    // 编辑商品列表
    async showEditDialogVisible(goods_id) {
      const { data: res } = await this.$http.get(`goods/${goods_id}`);
      console.log(res, "ooo");
      if (res.meta.status !== 200) {
        return this.$message.error("查询商品信息失败");
      }
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    //重置编辑列表
    editFormClosed() {
      this.$refs.editFormRef.resetFields()
    },
    //修改数据提交表单
    confirmEditForm() {
     this.$refs.editFormRef.validate( async (valid) =>{
        if(!valid) return
        const { data:res } = await this.$http.put('goods/'+ this.editForm.goods_id,{
          goods_name: this.editForm.goods_name,
          goods_price: this.editForm.goods_price,
          goods_weight: this.editForm.goods_weight,
          goods_number: this.editForm.goods_number,
          goods_cat:this.editForm.goods_cat
        })
        console.log(res,"ppp");
        if(res.meta.status !==200){
        return this.$message.error('修改商品信息失败')
        }
        this.editDialogVisible = false
        this.$message.success('修改商品信息成功')
        this.getGoodsList()
     })
   }
  },
};
</script>


<style lang="less" scoped>
</style>