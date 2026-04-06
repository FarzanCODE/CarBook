import { useState, useEffect } from "react";
import axiosInstance from "../../api/axios";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import {
  Car,
  Users,
  Calendar,
  CreditCard,
  Check,
  X,
  Plus,
  Trash,
  Edit,
  Star,
  MapPin,
} from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [cars, setCars] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  const [showAddCar, setShowAddCar] = useState(false);
  const [carForm, setCarForm] = useState({
    name: "",
    brand: "",
    category: "Sedan",
    description: "",
    location: "",
    perHour: "",
    perDay: "",
    perWeek: "",
    seats: 5,
    fuelType: "Petrol",
    transmission: "Manual",
    mileage: "",
    year: "",
    isAvailable: true,
  });
  const [carImages, setCarImages] = useState([]);
  const [carLoading, setCarLoading] = useState(false);
  const [showEditCar, setShowEditCar] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const [homeSettings, setHomeSettings] = useState(null);
  const [founderForm, setFounderForm] = useState({
    name: "",
    role: "",
    bio: "",
  });
  const [founderImage, setFounderImage] = useState(null);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [testimonialForm, setTestimonialForm] = useState({
    name: "",
    city: "",
    text: "",
    rating: 5,
  });
  const [editingTestimonialId, setEditingTestimonialId] = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [statsRes, bookingsRes, carsRes, homeRes] = await Promise.all([
        axiosInstance.get("/bookings/admin/stats"),
        axiosInstance.get("/bookings/admin/all"),
        axiosInstance.get("/cars?adminView=true"),
        axiosInstance.get("/home-settings"),
      ]);
      setStats(statsRes.data.stats);
      setBookings(bookingsRes.data.bookings);
      setCars(carsRes.data.cars);
      setHomeSettings(homeRes.data.settings);
      if (homeRes.data.settings) {
        setFounderForm({
          name: homeRes.data.settings.founder.name,
          role: homeRes.data.settings.founder.role,
          bio: homeRes.data.settings.founder.bio,
        });
      }
    } catch (error) {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (bookingId) => {
    try {
      await axiosInstance.put(`/bookings/${bookingId}/complete`);
      toast.success("Booking marked as completed!");
      loadAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed");
    }
  };

  const handleConfirmManual = async (bookingId) => {
    try {
      await axiosInstance.put(`/bookings/${bookingId}/confirm`);
      toast.success("Booking confirmed manually!");
      loadAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed");
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this booking record? This cannot be undone.",
      )
    )
      return;
    try {
      await axiosInstance.delete(`/bookings/${bookingId}`);
      toast.success("Booking deleted successfully!");
      loadAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed");
    }
  };

  const handleDeleteCar = async (carId) => {
    if (!window.confirm("Delete this car? This cannot be undone.")) return;
    try {
      await axiosInstance.delete(`/cars/${carId}`);
      toast.success("Car deleted!");
      loadAll();
    } catch (error) {
      toast.error("Failed to delete car");
    }
  };

  const handleEditClick = (car) => {
    setEditForm({
      _id: car._id,
      name: car.name,
      brand: car.brand,
      category: car.category,
      description: car.description,
      location: car.location,
      perHour: car.pricing.perHour,
      perDay: car.pricing.perDay,
      perWeek: car.pricing.perWeek,
      seats: car.specs.seats,
      fuelType: car.specs.fuelType,
      transmission: car.specs.transmission,
      mileage: car.specs.mileage || "",
      year: car.specs.year || "",
      isAvailable: car.isAvailable,
      existingImages: car.images || [],
    });
    setCarImages([]);
    setShowEditCar(true);
    setShowAddCar(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteExistingImage = async (carId, imageUrl) => {
    if (!window.confirm("Delete this image permanently?")) return;
    try {
      await axiosInstance.delete(`/cars/${carId}/image`, {
        data: { imageUrl },
      });
      toast.success("Image deleted!");
      setEditForm((prev) => ({
        ...prev,
        existingImages: prev.existingImages.filter((img) => img !== imageUrl),
      }));
      loadAll();
    } catch (error) {
      toast.error("Failed to delete image");
    }
  };

  const handleUpdateCar = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const formData = new FormData();
      Object.keys(editForm).forEach((key) => {
        if (key !== "existingImages" && key !== "_id") {
          formData.append(key, editForm[key]);
        }
      });
      carImages.forEach((img) => {
        formData.append("images", img);
      });

      await axiosInstance.put(`/cars/${editForm._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Car updated successfully!");
      setShowEditCar(false);
      setEditForm(null);
      setCarImages([]);
      loadAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update car");
    } finally {
      setEditLoading(false);
    }
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
    setCarLoading(true);
    try {
      const formData = new FormData();
      Object.keys(carForm).forEach((key) => {
        formData.append(key, carForm[key]);
      });
      carImages.forEach((img) => {
        formData.append("images", img);
      });

      await axiosInstance.post("/cars", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Car added successfully!");
      setShowAddCar(false);
      setCarImages([]);
      setCarForm({
        name: "",
        brand: "",
        category: "Sedan",
        description: "",
        location: "",
        perHour: "",
        perDay: "",
        perWeek: "",
        seats: 5,
        fuelType: "Petrol",
        transmission: "Manual",
        mileage: "",
        year: "",
        isAvailable: true,
      });
      loadAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add car");
    } finally {
      setCarLoading(false);
    }
  };

  const handleUpdateFounder = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", founderForm.name);
    formData.append("role", founderForm.role);
    formData.append("bio", founderForm.bio);
    if (founderImage) formData.append("image", founderImage);

    try {
      await axiosInstance.put("/home-settings/founder", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Founder profile updated!");
      loadAll();
    } catch (error) {
      toast.error("Failed to update founder profile");
    }
  };

  const handleTestimonialSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTestimonialId) {
        await axiosInstance.put("/home-settings/testimonial", {
          testimonialId: editingTestimonialId,
          ...testimonialForm,
        });
        toast.success("Testimonial updated!");
      } else {
        await axiosInstance.post("/home-settings/testimonial", testimonialForm);
        toast.success("Testimonial added!");
      }
      setShowTestimonialModal(false);
      setEditingTestimonialId(null);
      setTestimonialForm({ name: "", city: "", text: "", rating: 5 });
      loadAll();
    } catch (error) {
      toast.error("Action failed");
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm("Delete this testimonial?")) return;
    try {
      await axiosInstance.delete(`/home-settings/testimonial/${id}`);
      toast.success("Testimonial deleted!");
      loadAll();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  if (loading) return <Loader />;

  const statCards = [
    {
      label: "Total Bookings",
      value: stats?.totalBookings || 0,
      icon: <Calendar size={24} />,
      color: "text-blue-400",
    },
    {
      label: "Confirmed",
      value: stats?.confirmedBookings || 0,
      icon: <Check size={24} />,
      color: "text-green-400",
    },
    {
      label: "Completed",
      value: stats?.completedBookings || 0,
      icon: <Star size={24} />,
      color: "text-yellow-400",
    },
    {
      label: "Cancelled",
      value: stats?.cancelledBookings || 0,
      icon: <X size={24} />,
      color: "text-red-400",
    },
    {
      label: "Total Revenue",
      value: `₹${stats?.totalRevenue?.toLocaleString("en-IN") || 0}`,
      icon: <CreditCard size={24} />,
      color: "text-primary",
    },
    {
      label: "Total Cars",
      value: stats?.totalCars || 0,
      icon: <Car size={24} />,
      color: "text-purple-400",
    },
  ];

  const tabs = ["overview", "bookings", "cars", "home-page"];

  return (
    <div className="min-h-screen px-4 pt-36 pb-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Admin <span className="text-primary">Dashboard</span>
        </h1>
        <p className="text-gray-400">Manage your CarBook platform</p>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-colors flex-shrink-0
              ${activeTab === tab ? "bg-primary text-white" : "bg-background border border-gray-700 text-gray-400 hover:border-primary hover:text-primary"}`}
          >
            {tab.replace("-", " ")}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {statCards.map((stat) => (
              <div
                key={stat.label}
                className="bg-background border border-gray-800 rounded-2xl p-5"
              >
                <div className={`${stat.color} mb-3`}>{stat.icon}</div>
                <div className="text-white font-bold text-2xl">
                  {stat.value}
                </div>
                <div className="text-gray-500 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="bg-background border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-bold text-xl mb-4">
              Recent Bookings
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-800">
                    <th className="text-left py-3 pr-4">Booking ID</th>
                    <th className="text-left py-3 pr-4">User</th>
                    <th className="text-left py-3 pr-4">Car</th>
                    <th className="text-left py-3 pr-4">Amount</th>
                    <th className="text-left py-3 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 5).map((b) => (
                    <tr
                      key={b._id}
                      className="border-b border-gray-800/50 hover:bg-card/30"
                    >
                      <td className="py-3 pr-4 text-gray-400">
                        {b._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3 pr-4 text-white">{b.user?.name}</td>
                      <td className="py-3 pr-4 text-white">{b.car?.name}</td>
                      <td className="py-3 pr-4 text-primary font-bold">
                        ₹{b.totalAmount?.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs capitalize border ${b.status === "confirmed" ? "bg-green-500/10 text-green-400 border-green-500/30" : b.status === "pending" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" : "bg-gray-500/10 text-gray-400"}`}
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "bookings" && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="text-center py-20 bg-background border border-gray-800 rounded-3xl">
              <div className="text-6xl mb-4 opacity-20">📅</div>
              <h3 className="text-white text-xl font-bold mb-2">
                No bookings yet
              </h3>
              <p className="text-gray-400">
                When customers book your cars, they will appear here.
              </p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-background border border-gray-800 rounded-2xl p-5 flex flex-wrap justify-between items-center gap-4"
              >
                <div>
                  <div className="text-white font-bold text-lg">
                    {booking.car?.brand} {booking.car?.name}
                  </div>
                  <div className="text-gray-400 text-sm">
                    Customer:{" "}
                    <span className="text-white">{booking.user?.name}</span> (
                    {booking.user?.email})
                  </div>
                  <div className="text-gray-400 text-sm">
                    {new Date(booking.startDate).toLocaleDateString()} →{" "}
                    {new Date(booking.endDate).toLocaleDateString()}
                  </div>
                  <div className="text-primary font-bold">
                    ₹{booking.totalAmount?.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize border ${booking.status === "confirmed" ? "bg-green-500/10 text-green-400 border-green-500/30" : booking.status === "pending" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" : "bg-gray-500/10 text-gray-400"}`}
                  >
                    {booking.status}
                  </span>
                  {booking.status === "pending" && (
                    <button
                      onClick={() => handleConfirmManual(booking._id)}
                      className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-colors text-sm font-bold"
                    >
                      Confirm
                    </button>
                  )}
                  {booking.status === "confirmed" && (
                    <button
                      onClick={() => handleComplete(booking._id)}
                      className="bg-primary/20 text-primary px-4 py-2 rounded-lg hover:bg-primary/30 transition-colors text-sm font-bold"
                    >
                      Mark Completed
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteBooking(booking._id)}
                    className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors border border-red-500/20"
                    title="Delete Booking"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "cars" && (
        <div className="space-y-8">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setShowAddCar(!showAddCar);
                setShowEditCar(false);
              }}
              className="flex items-center gap-2 bg-gradient-primary rounded-full px-6 py-3 text-white font-bold"
            >
              <Plus size={18} /> {showAddCar ? "Cancel" : "Add New Car"}
            </button>
          </div>

          {showAddCar && (
            <form
              onSubmit={handleAddCar}
              className="bg-background border border-gray-800 rounded-2xl p-6 space-y-6"
            >
              <h3 className="text-white font-bold text-xl">Add New Car</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { label: "Car Name *", field: "name", type: "text" },
                  { label: "Brand *", field: "brand", type: "text" },
                  { label: "Location *", field: "location", type: "text" },
                  { label: "Mileage", field: "mileage", type: "text" },
                  { label: "Year", field: "year", type: "number" },
                  { label: "Seats", field: "seats", type: "number" },
                  { label: "Per Hour ₹", field: "perHour", type: "number" },
                  { label: "Per Day ₹", field: "perDay", type: "number" },
                  { label: "Per Week ₹", field: "perWeek", type: "number" },
                ].map((i) => (
                  <div key={i.field}>
                    <label className="text-gray-400 text-sm mb-2 block">
                      {i.label}
                    </label>
                    <input
                      required={i.label.includes("*")}
                      type={i.type}
                      value={carForm[i.field]}
                      onChange={(e) =>
                        setCarForm({ ...carForm, [i.field]: e.target.value })
                      }
                      className="w-full bg-card text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-primary"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">
                    Category *
                  </label>
                  <select
                    required
                    value={carForm.category}
                    onChange={(e) =>
                      setCarForm({ ...carForm, category: e.target.value })
                    }
                    className="w-full bg-card text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-primary transition-colors"
                  >
                    <option value="">Select Category</option>
                    {[
                      "Sedan",
                      "SUV",
                      "Luxury",
                      "Electric",
                      "Bike/Scooter",
                      "Mini/Hatchback",
                      "General",
                    ].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">
                    Fuel Type
                  </label>
                  <select
                    value={carForm.fuelType}
                    onChange={(e) =>
                      setCarForm({ ...carForm, fuelType: e.target.value })
                    }
                    className="w-full bg-card text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-primary transition-colors"
                  >
                    {["Petrol", "Diesel", "Electric", "Hybrid", "CNG"].map(
                      (f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ),
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">
                    Transmission
                  </label>
                  <select
                    value={carForm.transmission}
                    onChange={(e) =>
                      setCarForm({ ...carForm, transmission: e.target.value })
                    }
                    className="w-full bg-card text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-primary transition-colors"
                  >
                    {["Manual", "Automatic", "CVT", "DCT", "AMT"].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-2 block">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={carForm.description}
                  onChange={(e) =>
                    setCarForm({ ...carForm, description: e.target.value })
                  }
                  className="w-full bg-card text-white px-4 py-3 rounded-xl border border-gray-700 resize-none"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-2 block">
                  Car Images
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setCarImages(Array.from(e.target.files))}
                  className="w-full bg-card text-white px-4 py-3 rounded-xl border border-gray-700"
                />
              </div>
              <button
                type="submit"
                disabled={carLoading}
                className="w-full bg-gradient-primary text-white font-bold py-4 rounded-xl"
              >
                {carLoading ? "Adding..." : "Add Car"}
              </button>
            </form>
          )}

          {showEditCar && editForm && (
            <form
              onSubmit={handleUpdateCar}
              className="bg-background border-2 border-primary/30 rounded-2xl p-6 relative space-y-6"
            >
              <button
                type="button"
                onClick={() => setShowEditCar(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white"
              >
                <X size={20} />
              </button>
              <h3 className="text-white font-bold text-xl">
                Edit: {editForm.brand} {editForm.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { label: "Car Name *", field: "name", type: "text" },
                  { label: "Brand *", field: "brand", type: "text" },
                  { label: "Location *", field: "location", type: "text" },
                  { label: "Year", field: "year", type: "number" },
                  { label: "Per Hour ₹", field: "perHour", type: "number" },
                  { label: "Per Day ₹", field: "perDay", type: "number" },
                ].map((i) => (
                  <div key={i.field}>
                    <label className="text-gray-400 text-sm mb-2 block">
                      {i.label}
                    </label>
                    <input
                      required={i.label.includes("*")}
                      type={i.type}
                      value={editForm[i.field]}
                      onChange={(e) =>
                        setEditForm({ ...editForm, [i.field]: e.target.value })
                      }
                      className="w-full bg-card text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-primary"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">
                    Category *
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value })
                    }
                    className="w-full bg-card text-white px-4 py-3 rounded-xl border border-gray-700"
                  >
                    {[
                      "Sedan",
                      "SUV",
                      "Luxury",
                      "Electric",
                      "Bike/Scooter",
                      "Mini/Hatchback",
                      "General",
                    ].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">
                    Fuel Type
                  </label>
                  <select
                    value={editForm.fuelType}
                    onChange={(e) =>
                      setEditForm({ ...editForm, fuelType: e.target.value })
                    }
                    className="w-full bg-card text-white px-4 py-3 rounded-xl border border-gray-700"
                  >
                    {["Petrol", "Diesel", "Electric", "Hybrid", "CNG"].map(
                      (f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ),
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">
                    Transmission
                  </label>
                  <select
                    value={editForm.transmission}
                    onChange={(e) =>
                      setEditForm({ ...editForm, transmission: e.target.value })
                    }
                    className="w-full bg-card text-white px-4 py-3 rounded-xl border border-gray-700"
                  >
                    {["Manual", "Automatic", "CVT", "DCT", "AMT"].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-8">
                  <input
                    type="checkbox"
                    checked={editForm.isAvailable}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        isAvailable: e.target.checked,
                      })
                    }
                    className="w-5 h-5 accent-primary"
                  />
                  <label className="text-white">Available</label>
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-2 block">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  className="w-full bg-card text-white px-4 py-3 rounded-xl border border-gray-700 resize-none"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-2 block">
                  Manage Images
                </label>
                <div className="flex flex-wrap gap-3 mb-4">
                  {editForm.existingImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative w-20 h-20 rounded-lg overflow-hidden group"
                    >
                      <img
                        src={img}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteExistingImage(editForm._id, img)
                        }
                        className="absolute inset-0 bg-red-500/60 flex items-center justify-center opacity-0 group-hover:opacity-100"
                      >
                        <Trash size={16} className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setCarImages(Array.from(e.target.files))}
                  className="w-full bg-card text-white px-4 py-3 rounded-xl border border-gray-700"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowEditCar(false)}
                  className="flex-1 py-4 bg-gray-800 text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-4 bg-gradient-primary text-white rounded-xl font-bold"
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <div
                key={car._id}
                className={`bg-background border rounded-2xl overflow-hidden group hover:border-primary/50 transition-all ${!car.isAvailable ? "border-red-900/40" : "border-gray-800"}`}
              >
                <div className="h-44 bg-card relative">
                  {car.images?.[0] ? (
                    <img
                      src={car.images[0]}
                      alt=""
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform ${!car.isAvailable ? "opacity-50 grayscale" : ""}`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">
                      🚗
                    </div>
                  )}
                  <button
                    onClick={() => handleDeleteCar(car._id)}
                    className="absolute top-2 right-2 p-2 bg-red-500/20 text-red-500 rounded-full border border-red-500/20 z-10"
                  >
                    <Trash size={16} />
                  </button>
                </div>
                <div className="p-4">
                  <h4 className="text-white font-bold">
                    {car.brand} {car.name}{" "}
                    {!car.isAvailable && (
                      <span className="text-red-500 text-xs ml-2">
                        (Unavailable)
                      </span>
                    )}
                  </h4>
                  <p className="text-gray-400 text-sm mb-3">
                    {car.category} • {car.location}
                  </p>
                  <div className="flex items-center justify-between border-t border-gray-800 pt-3">
                    <span
                      className={`text-xs px-3 py-1 rounded-full border ${car.isAvailable ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}
                    >
                      {car.isAvailable ? "Available" : "Unavailable"}
                    </span>
                    <button
                      onClick={() => handleEditClick(car)}
                      className="text-primary text-sm font-bold"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "home-page" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-background border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-bold text-xl mb-6">
              Founder Profile
            </h3>
            <form onSubmit={handleUpdateFounder} className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm block mb-1">Name</label>
                <input
                  type="text"
                  value={founderForm.name}
                  onChange={(e) =>
                    setFounderForm({ ...founderForm, name: e.target.value })
                  }
                  className="w-full bg-card text-white px-4 py-3 rounded-xl border border-gray-700"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Role</label>
                <input
                  type="text"
                  value={founderForm.role}
                  onChange={(e) =>
                    setFounderForm({ ...founderForm, role: e.target.value })
                  }
                  className="w-full bg-card text-white px-4 py-3 rounded-xl border border-gray-700"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Bio</label>
                <textarea
                  rows={4}
                  value={founderForm.bio}
                  onChange={(e) =>
                    setFounderForm({ ...founderForm, bio: e.target.value })
                  }
                  className="w-full bg-card text-white px-4 py-3 rounded-xl border border-gray-700 resize-none"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">
                  Profile Image
                </label>
                <input
                  type="file"
                  onChange={(e) => setFounderImage(e.target.files[0])}
                  className="w-full bg-card text-white px-4 py-3 rounded-xl border border-gray-700"
                />
                {homeSettings?.founder?.image && (
                  <img
                    src={homeSettings.founder.image}
                    className="w-16 h-16 rounded-full mt-4 object-cover border-2 border-primary"
                    alt=""
                  />
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-primary text-white font-bold py-3 rounded-xl"
              >
                Update Founder
              </button>
            </form>
          </div>
          <div className="bg-background border border-gray-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-bold text-xl">Testimonials</h3>
              <button
                onClick={() => {
                  setEditingTestimonialId(null);
                  setTestimonialForm({
                    name: "",
                    city: "",
                    text: "",
                    rating: 5,
                  });
                  setShowTestimonialModal(true);
                }}
                className="bg-primary/20 text-primary p-2 rounded-lg hover:bg-primary/30"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="space-y-4">
              {homeSettings?.testimonials?.map((t) => (
                <div
                  key={t._id}
                  className="bg-card/50 p-4 rounded-xl border border-gray-800 flex justify-between items-start"
                >
                  <div>
                    <div className="text-white font-bold">
                      {t.name}{" "}
                      <span className="text-gray-400 font-normal text-xs">
                        • {t.city}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">"{t.text}"</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingTestimonialId(t._id);
                        setTestimonialForm({
                          name: t.name,
                          city: t.city,
                          text: t.text,
                          rating: t.rating,
                        });
                        setShowTestimonialModal(true);
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteTestimonial(t._id)}
                      className="text-red-400 hover:text-red-500"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {showTestimonialModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-background border border-gray-800 rounded-3xl p-8 w-full max-w-md">
                <h3 className="text-2xl font-bold text-white mb-6">
                  {editingTestimonialId ? "Edit Review" : "Add Review"}
                </h3>
                <form onSubmit={handleTestimonialSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Name"
                    value={testimonialForm.name}
                    onChange={(e) =>
                      setTestimonialForm({
                        ...testimonialForm,
                        name: e.target.value,
                      })
                    }
                    className="w-full bg-card text-white px-4 py-3 rounded-xl border border-gray-700"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={testimonialForm.city}
                    onChange={(e) =>
                      setTestimonialForm({
                        ...testimonialForm,
                        city: e.target.value,
                      })
                    }
                    className="w-full bg-card text-white px-4 py-3 rounded-xl border border-gray-700"
                  />
                  <textarea
                    placeholder="Review"
                    value={testimonialForm.text}
                    onChange={(e) =>
                      setTestimonialForm({
                        ...testimonialForm,
                        text: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full bg-card text-white px-4 py-3 rounded-xl border border-gray-700 resize-none"
                  />
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-primary text-white font-bold py-3 rounded-xl"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowTestimonialModal(false)}
                      className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-xl"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
