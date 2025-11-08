import { AdminHeader } from "../../components/AdminHeader";
import { Footer } from "../../components/Footer";
import { Modal } from "../../components/Modal";
import { AdminFAQItem } from "../../components/AdminFAQItem";
import { useState, useEffect } from "react";
import faqService from "../../services/faqService";

export function FAQSManagement() {
  const [FAQs, setFAQs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null); // "edit" | "delete" | "add"
  const [selectedFAQ, setSelectedFAQ] = useState(null);
  const [formData, setFormData] = useState({ 
    question: "", 
    answer: "", 
    category: "General",
    displayOrder: 0,
    isPublished: true
  });

  // Load FAQs from database
  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    try {
      setLoading(true);
      const response = await faqService.getAllFaqs();
      setFAQs(response || []);
    } catch (error) {
      console.error('Error loading FAQs:', error);
      alert('Failed to load FAQs from database');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (faq) => {
    setSelectedFAQ(faq);
    setFormData({ 
      question: faq.question, 
      answer: faq.answer,
      category: faq.category || "General",
      displayOrder: faq.displayOrder || 0,
      isPublished: faq.isPublished !== undefined ? faq.isPublished : true
    });
    setModalAction("edit");
    setShowModal(true);
  };

  const openDelete = (faq) => {
    setSelectedFAQ(faq);
    setModalAction("delete");
    setShowModal(true);
  };

  const openAdd = () => {
    setSelectedFAQ(null);
    setFormData({ 
      question: "", 
      answer: "",
      category: "General",
      displayOrder: FAQs.length,
      isPublished: true
    });
    setModalAction("add");
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((s) => ({ 
      ...s, 
      [id]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    const q = formData.question?.trim();
    const a = formData.answer?.trim();
    if (!q || !a) return alert("Please provide both question and answer.");

    try {
      if (modalAction === "edit" && selectedFAQ) {
        // Update existing FAQ
        await faqService.updateFaq(selectedFAQ.faqId, {
          faqId: selectedFAQ.faqId,
          question: q,
          answer: a,
          category: formData.category,
          displayOrder: formData.displayOrder,
          isPublished: formData.isPublished
        });
        alert('FAQ updated successfully');
      } else if (modalAction === "add") {
        // Create new FAQ
        await faqService.createFaq({
          question: q,
          answer: a,
          category: formData.category,
          displayOrder: formData.displayOrder,
          isPublished: formData.isPublished
        });
        alert('FAQ created successfully');
      }

      setShowModal(false);
      setModalAction(null);
      setSelectedFAQ(null);
      loadFAQs(); // Reload from database
    } catch (error) {
      console.error('Error saving FAQ:', error);
      alert('Failed to save FAQ');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedFAQ) return;
    
    try {
      await faqService.deleteFaq(selectedFAQ.faqId);
      alert('FAQ deleted successfully');
      setShowModal(false);
      setModalAction(null);
      setSelectedFAQ(null);
      loadFAQs(); // Reload from database
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      alert('Failed to delete FAQ');
    }
  };

  return (
    <>
      <div className="background">
        <AdminHeader />
        <div className="container my-4">
          <div className="row justify-content-center">
            <div id="card-container" className="card shadow p-4 card-container">
              <h2 className="mb-4">FAQ Management</h2>
              
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="accordion" id="factsAccordion">
                    {FAQs.map((FAQ, index) => (
                      <AdminFAQItem
                        key={FAQ.faqId}
                        id={FAQ.faqId}
                        question={FAQ.question}
                        answer={FAQ.answer}
                        defaultOpen={index === 0}
                        onEdit={() => openEdit(FAQ)}
                        onDelete={() => openDelete(FAQ)}
                      />
                    ))}
                  </div>

                  <div className="mt-3 d-flex justify-content-center">
                    <button className="btn btn-primary" onClick={openAdd}>
                      Add new FAQ
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <Footer />

        {showModal && modalAction !== "delete" && (
          <Modal onClose={() => setShowModal(false)}>
            <form onSubmit={handleSave}>
              <h2 className="mb-3">
                {modalAction === "edit" ? "Edit FAQ" : "Add FAQ"}
              </h2>
              <div className="mb-3">
                <label htmlFor="question" className="form-label">
                  Question <span className="text-danger">*</span>
                </label>
                <textarea
                  id="question"
                  className="form-control"
                  rows={2}
                  value={formData.question}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="answer" className="form-label">
                  Answer <span className="text-danger">*</span>
                </label>
                <textarea
                  id="answer"
                  className="form-control"
                  rows={4}
                  value={formData.answer}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="category" className="form-label">
                  Category
                </label>
                <select
                  id="category"
                  className="form-select"
                  value={formData.category}
                  onChange={handleFormChange}
                >
                  <option value="General">General</option>
                  <option value="JobSeekers">Job Seekers</option>
                  <option value="Employers">Employers</option>
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="displayOrder" className="form-label">
                  Display Order
                </label>
                <input
                  type="number"
                  id="displayOrder"
                  className="form-control"
                  value={formData.displayOrder}
                  onChange={handleFormChange}
                  min="0"
                />
              </div>
              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  id="isPublished"
                  className="form-check-input"
                  checked={formData.isPublished}
                  onChange={handleFormChange}
                />
                <label htmlFor="isPublished" className="form-check-label">
                  Published
                </label>
              </div>
              <div className="d-flex justify-content-center gap-2">
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </Modal>
        )}

        {showModal && modalAction === "delete" && (
          <Modal onClose={() => setShowModal(false)}>
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete this FAQ?</p>
            <div className="d-flex justify-content-center gap-2">
              <button className="btn btn-danger" onClick={handleConfirmDelete}>
                Yes, Delete
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </Modal>
        )}
      </div>
    </>
  );
}
