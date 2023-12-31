const User = require("../../models/Users");
const Barang = require("../../models/barangs");
const deleteFromGcs = require("../../modules/DeleteBucketFile");

const postBarang = async (req, res) => {
  const { title, description, harga, location, stock } = req.body;
  const { id: userId } = req.user;
  const { files } = req;

  const images = files ? files.map((file) => file.cloudStoragePublicUrl) : null;

  const barang = await Barang.create({
    title: title,
    description: description,
    userId: userId,
    harga: parseInt(harga),
    location: location,
    image: images,
    stock: parseInt(stock),
  });

  res.status(201).json({
    code: 201,
    data: barang,
    message: "Success post barang",
  });
}

const getAllBarang = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    const result = await Barang.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{
        model: User,
        attributes: ['username', 'id'],
      }],
    });
    const totalPages = Math.ceil(result.count / limit);

    if(result.rows.length === 0) {
      return res.status(404).json({
        code: 404,
        message: "No barang found",
      });
    }

    const barangs = result.rows.map((barang) => {
      return {
        id: barang.id,
        title: barang.title,
        description: barang.description,
        harga: barang.harga,
        location: barang.location,
        stock: barang.stock,
        images: encodeURI(barang.image),
        postBy: barang.user,
      };
    });

    res.status(200).json({
      code: 200,
      message: "Success get all barang",
      barang: barangs,
      totalItems: result.count,
      totalPages,
      currentPage: parseInt(page),
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: 'Internal Server Error' 
    });
  }
};

const getBarangById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Barang.findOne({
      where: { id },
      include: [{
        model: User,
        attributes: ['username', 'id'],
      }],
    });

    const barangs = {
      id: result.id,
      title: result.title,
      description: result.description,
      harga: result.harga,
      location: result.location,
      stock: result.stock,
      images: encodeURI(result.image),
      postBy: result.user,
    };

    res.status(200).json({
      code: 200,
      message: "Success get data barang",
      barang: barangs,
      message: "Success get barang",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

const getMyPostBarang = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { limit = 10, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    const result = await Barang.findAndCountAll({
      where: { userId: userId },
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{
        model: User,
        attributes: ['username', 'id'],
      }],
    });

    const totalPages = Math.ceil(result.count / limit);

    if(result.rows.length === 0) {
      return res.status(404).json({
        code: 404,
        message: "You not post any barang yet",
      });
    }

    const barangs = result.rows.map((barang) => {
      return {
        barangId: barang.id,
        title: barang.title,
        description: barang.description,
        harga: barang.harga,
        location: barang.location,
        stock: barang.stock,
        images: encodeURI(barang.image),
        postBy: barang.user,
      };
    });

    res.status(200).json({
      code: 200,
      message: "Success get all barang",
      barang: barangs,
      totalItems: result.count,
      totalPages,
      currentPage: parseInt(page),
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: 'Internal Server Error' 
    });
  }
}

const deleteMyBarang = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { barangId } = req.params;

    const result = await Barang.findOne({
      where: { id: barangId, userId: userId },
    });

    if (!result) {
      return res.status(404).json({
        code: 404,
        message: "Barang not found",
      });
    }

    const images = result.image;

    try {
      await Promise.all(
        images.map(async (image) => {
          const filename = image.split('/').pop();
          console.log(`Deleting ${filename} from GCS`);
          await deleteFromGcs(filename); 
          console.log(`${filename} deleted from GCS`);
        })
      );

      await Barang.destroy({
        where: { id: barangId, userId: userId },
      });

      return res.status(200).json({
        code: 200,
        message: "Success delete barang",
      });
      
    } catch (error) {

      if(error.code === 404){
        await Barang.destroy({
          where: { id: barangId, userId: userId },
        });
  
        return res.status(200).json({
          code: 200,
          message: "Success delete barang",
        });
      }

      return res.status(500).json({
        code: 500,
        message: "Internal Server Error",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

module.exports = {
  postBarang,
  getAllBarang,
  getBarangById,
  getMyPostBarang,
  deleteMyBarang,
}