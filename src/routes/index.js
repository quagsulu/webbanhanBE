import express from "express";
import routerProducts from "./products";
import routerCategory from "./category";
import routerComment from "./comment";
import routerUser from "./user";
const router = express.Router();

router.use("/products", routerProducts);
// router.use("/", routerProducts);
routerInit.use('/category', routerCategory)
routerInit.use('/comment', routerComment)
routerInit.use('/user', routerUser)



// router.use("/users", routerUsers);
export default router;
