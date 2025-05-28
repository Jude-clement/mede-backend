const db = require('../config/db');

// App Info
exports.checkAppInfo = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM med_info LIMIT 1');
    
    if (!rows[0]) {
      throw new Error('App info not found');
    }

    res.status(200).json({
      error: false,
      currentversion: rows[0].currentversion || "",
      releasedate: rows[0].releasedate || "",
      appstoreurl: rows[0].appstoreurl || "",
      playstoreurl: rows[0].playstoreurl || "",
      maintenance: rows[0].maintenance || "",
      newsstatus: rows[0].newsstatus || 0,
      maintenancemessage: rows[0].maintenancemessage || ""
    });
  } catch (error) {
    res.status(200).json({
      error: true,
      currentversion: "",
      releasedate: "",
      appstoreurl: "",
      playstoreurl: "",
      maintenance: "",
      newsstatus: 0,
      maintenancemessage: ""
    });
  }
};

// Terms and Conditions
exports.getTermsAndConditions = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT terms, releasedate FROM med_info LIMIT 1');
    
    res.status(200).json({
      error: "false",
      relasedate: rows[0]?.releasedate || "",
      message: "Success",
      terms: rows[0]?.terms || ""
    });
  } catch (error) {
    res.status(200).json({
      error: "true",
      relasedate: "",
      message: error.message,
      terms: ""
    });
  }
};

// About Us
exports.getAboutUs = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT aboutus, releasedate FROM med_info LIMIT 1');
    
    res.status(200).json({
      error: "false",
      relasedate: rows[0]?.releasedate || "",
      message: "Success",
      aboutus: rows[0]?.aboutus || ""
    });
  } catch (error) {
    res.status(200).json({
      error: "true",
      relasedate: "",
      message: error.message,
      aboutus: ""
    });
  }
};
