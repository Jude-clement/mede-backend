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
      message: 'App info found',
      currentversion: rows[0].currentversion || "",
      releasedate: rows[0].releasedate || "",
      appstoreurl: rows[0].appstoreurl || "",
      playstoreurl: rows[0].playstoreurl || "",
      maintenance: rows[0].maintenance || 0,
      newsstatus: rows[0].newsstatus || 0,
      maintenancemessage: rows[0].maintenancemessage || "",
      releasenote: rows[0].releasenote || "",

    });
  } catch (error) {
    res.status(200).json({
      error: true,
      message: 'Error checking app info',
      currentversion: "",
      releasedate: "",
      appstoreurl: "",
      playstoreurl: "",
      maintenance: 0,
      newsstatus: 0,
      maintenancemessage: "",
      releasenote: "",
    });
  }
};

// Terms and Conditions
exports.getTermsAndConditions = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT terms, releasedate FROM med_info LIMIT 1');
    
    res.status(200).json({
      error: false,
      relasedate: rows[0]?.releasedate || "",
      message: "Success",
      terms: rows[0]?.terms || ""
    });
  } catch (error) {
    res.status(200).json({
      error: true,
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
      error: false,
      relasedate: rows[0]?.releasedate || "",
      message: "Success",
      aboutus: rows[0]?.aboutus || ""
    });
  } catch (error) {
    res.status(200).json({
      error: true,
      relasedate: "",
      message: error.message,
      aboutus: ""
    });
  }
};
