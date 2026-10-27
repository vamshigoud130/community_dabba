require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Menu = require('./models/Menu');
const Order = require('./models/Order');
const Subscription = require('./models/Subscription');
const Feedback = require('./models/Feedback');
const Whitelist = require('./models/Whitelist');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dabba_db';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected for Seeding...');

    await User.deleteMany();
    await Menu.deleteMany();
    await Order.deleteMany();
    await Subscription.deleteMany();
    await Feedback.deleteMany();
    await Whitelist.deleteMany();
    console.log('Cleared existing collections.');

    const whitelistedEmails = [
      'chenagonivamshi@gmail.com','dimpuchenagoni@gmail.com','vamshi@gmail.com',
      'aishwarya@gmail.com','cook@dabba.com','delivery@dabba.com','admin@dabba.com'
    ];
    for (const email of whitelistedEmails) await Whitelist.create({ email });
    console.log(`Seeded ${whitelistedEmails.length} whitelisted emails successfully!`);

    const users = [
      { name:'Vamshi Goud', email:'vamshi@gmail.com', password:'password123', role:'customer', phone:'9876543210', address:'H-No 4-12, PG Hostel, Madhapur, Hyderabad', isVerified:true },
      { name:'Aishwarya Patel', email:'aishwarya@gmail.com', password:'password123', role:'customer', phone:'9123456789', address:'Flat 402, Sunshine Apartments, Gachibowli, Hyderabad', isVerified:true },
      { name:'Annapurna Kitchen', email:'cook@dabba.com', password:'password123', role:'kitchen', phone:'8765432109', address:'Kitchen Block 2, Hitech City, Hyderabad', isVerified:true },
      { name:'Ramu Express', email:'delivery@dabba.com', password:'password123', role:'delivery', phone:'7654321098', address:'Delivery Hub A, Madhapur, Hyderabad', isVerified:true },
      { name:'Super Admin', email:'admin@dabba.com', password:'password123', role:'admin', phone:'9999999999', address:'Admin Headquarters, Hyderabad', isVerified:true }
    ];
    const createdUsers = [];
    for (const u of users) { const s = await new User(u).save(); createdUsers.push(s); }
    console.log(`Seeded ${createdUsers.length} users successfully!`);

    const customerVamshi = createdUsers[0];
    const customerAishwarya = createdUsers[1];
    const deliveryRamu = createdUsers[3];

    const menuItems = [
      { title:'Butter Idli Sambar (4 Pcs)', description:'Steaming hot rice cakes served with flavor-rich lentil sambar and fresh coconut chutney.', price:50, category:'Breakfast', day:'All', type:'Veg', available:true, image:'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80' },
      { title:'Aloo Paratha with Curd', description:'Tandoori wheat flatbread stuffed with spiced potatoes, served with fresh curd and butter.', price:60, category:'Breakfast', day:'All', type:'Veg', available:true, image:'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=400&q=80' },
      { title:'Spicy Egg Bread Omelette', description:'Two eggs whisked with onions, green chilies, coriander, toasted with white bread.', price:70, category:'Breakfast', day:'All', type:'Non-Veg', available:true, image:'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&q=80' },
      { title:'Classic Indori Poha', description:'Flattened rice seasoned with mustard seeds, turmeric, topped with sev, pomegranate, and lemon.', price:40, category:'Breakfast', day:'All', type:'Veg', available:true, image:'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=400&q=80' },
      { title:'Medu Vada Combo', description:'Crunchy deep-fried lentil donuts served with rich sambar and spicy ginger chutney.', price:60, category:'Breakfast', day:'All', type:'Veg', available:true, image:'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80' },
      { title:'Masala Dosa with Chutney', description:'Crispy golden rice-lentil crepe stuffed with spiced potato filling, served with tomato and coconut chutneys.', price:70, category:'Breakfast', day:'All', type:'Veg', available:true, image:'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&q=80' },
      { title:'Paneer Bhurji Paratha', description:'Scrambled spiced cottage cheese sauteed with onions and peppers, served with two whole-wheat parathas.', price:80, category:'Breakfast', day:'All', type:'Veg', available:true, image:'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80' },
      { title:'Standard Rice + Dal + Veg Curry', description:'Daily home-style comfort meal with steamed basmati rice, yellow tur dal, and seasonal mixed veg sabzi.', price:120, category:'Lunch', day:'All', type:'Veg', available:true, image:'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80' },
      { title:'Hyderabadi Chicken Biryani', description:'Aromatic long-grain basmati rice cooked with tender marinated chicken and secret spices, served with raita.', price:180, category:'Lunch', day:'All', type:'Non-Veg', available:true, image:'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80' },
      { title:'Shahi Paneer + 3 Butter Rotis', description:'Rich and creamy cottage cheese cubes in onion-tomato gravy, served with soft butter-slathered rotis.', price:140, category:'Lunch', day:'All', type:'Veg', available:true, image:'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80' },
      { title:'Kolhapuri Chicken Curry + Rice', description:'Fiery, rustic chicken curry infused with roasted sesame and coconut, served with white rice.', price:160, category:'Lunch', day:'All', type:'Non-Veg', available:true, image:'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80' },
      { title:'Chole Bhature Special', description:'Spicy white chickpea curry paired with two large fluffy puffed deep-fried flatbreads.', price:130, category:'Lunch', day:'All', type:'Veg', available:true, image:'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=400&q=80' },
      { title:'Veg Thali (7 Items)', description:'Wholesome thali - rice, 2 rotis, dal makhani, mix veg sabzi, raita, papad, and sweet gulab jamun.', price:180, category:'Lunch', day:'All', type:'Veg', available:true, image:'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80' },
      { title:'Mutton Curry + Rice', description:'Slow-cooked tender mutton pieces in a dark rich masala gravy, served with steamed white rice and salad.', price:220, category:'Lunch', day:'All', type:'Non-Veg', available:true, image:'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80' },
      { title:'Roti + Yellow Dal Tadka', description:'Tawa rotis paired with creamy yellow split lentils tempered with garlic, cumin, and red chilies.', price:100, category:'Dinner', day:'All', type:'Veg', available:true, image:'https://images.unsplash.com/photo-1585938338392-50a59970d8ee?w=400&q=80' },
      { title:'Dhaba Style Egg Curry + Rice', description:'Two hard-boiled eggs in a spicy tomato onion gravy, served alongside aromatic steamed rice.', price:120, category:'Dinner', day:'All', type:'Non-Veg', available:true, image:'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80' },
      { title:'Moong Dal Khichdi + Roasted Papad', description:'Light, healthy and therapeutic blend of rice and yellow lentils cooked with ghee and mild turmeric.', price:80, category:'Dinner', day:'All', type:'Veg', available:true, image:'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=400&q=80' },
      { title:'Methi Thepla + Aloo Dry Sabzi', description:'Soft Gujarati fenugreek flatbreads served with dry baby potatoes stir-fry and sweet pickle.', price:100, category:'Dinner', day:'All', type:'Veg', available:true, image:'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80' },
      { title:'Butter Chicken + Garlicky Naan', description:'Rich, sweet, and mild butter tomato gravy with grilled chicken chunks, served with garlic flatbread.', price:190, category:'Dinner', day:'All', type:'Non-Veg', available:true, image:'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80' },
      { title:'Palak Paneer + Jeera Rice', description:'Blanched spinach gravy with soft paneer cubes, paired with aromatic cumin-tempered basmati rice.', price:150, category:'Dinner', day:'All', type:'Veg', available:true, image:'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80' },
      { title:'Chicken Fried Rice + Manchurian', description:'Wok-tossed fragrant rice with shredded chicken and veggies, paired with crispy chilli chicken Manchurian.', price:170, category:'Dinner', day:'All', type:'Non-Veg', available:true, image:'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80' }
    ];

    const seededMenus = await Menu.insertMany(menuItems);
    console.log(`Seeded ${seededMenus.length} menu dishes successfully!`);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30);
    await Subscription.create({ userId:customerVamshi._id, plan:'Monthly', mealTypes:['Lunch','Dinner'], startDate, endDate, status:'Active', pausedDates:[], pricePaid:4500 });
    console.log('Seeded active monthly subscription for Vamshi!');

    const seededOrders = await Order.insertMany([
      { userId:customerVamshi._id, items:[{ menuId:seededMenus[7]._id, title:seededMenus[7].title, price:seededMenus[7].price, quantity:2 }], total:240, status:'Delivered', deliveryAddress:customerVamshi.address, phone:customerVamshi.phone, paymentMethod:'UPI', paymentStatus:'Paid', deliveryPerson:deliveryRamu._id, orderType:'One-Time', createdAt:new Date(Date.now()-86400000) },
      { userId:customerAishwarya._id, items:[{ menuId:seededMenus[1]._id, title:seededMenus[1].title, price:seededMenus[1].price, quantity:1 },{ menuId:seededMenus[0]._id, title:seededMenus[0].title, price:seededMenus[0].price, quantity:1 }], total:110, status:'Preparing', deliveryAddress:customerAishwarya.address, phone:customerAishwarya.phone, paymentMethod:'Card', paymentStatus:'Paid', orderType:'One-Time', createdAt:new Date() }
    ]);
    console.log(`Seeded ${seededOrders.length} orders!`);

    await Feedback.insertMany([
      { userId:customerVamshi._id, orderId:seededOrders[0]._id, foodRating:5, deliveryRating:4, comment:'Absolutely spectacular yellow dal! Simple, warm, healthy tiffin. Loved it.', createdAt:new Date(Date.now()-86400000) },
      { userId:customerAishwarya._id, foodRating:4, deliveryRating:5, comment:'Great clean packaging and the idlis were incredibly soft.', createdAt:new Date() }
    ]);
    console.log('Seeded customer reviews successfully!');
    console.log('Database Seeding Complete! Enjoy!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedData();
