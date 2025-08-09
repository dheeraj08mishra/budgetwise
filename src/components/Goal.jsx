import React, { useEffect, useState, useRef } from "react";
import { BASE_URL } from "../utils/constants";
import { toast } from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { setGoals } from "../utils/redux/goalSlice";

const Goal = () => {
  const dispatch = useDispatch();
  const goals = useSelector((state) => state.goal.goals) || [];
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalType, setModalType] = useState(""); // "addAmount" or "addGoal"
  const [activeGoal, setActiveGoal] = useState(null);
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [deleteGoalId, setDeleteGoalId] = useState(null);

  // Modal ref for DaisyUI dialog
  const modalRef = useRef(null);
  const deleteModalRef = useRef(null);

  useEffect(() => {
    const fetchAllGoals = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${BASE_URL}/goal/list`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error("Failed to fetch goals");
        const data = await response.json();
        dispatch(setGoals(data.goals));
      } catch (error) {
        console.error("Error fetching goals:", error);
        toast.error("Error fetching goals.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllGoals();
  }, [dispatch]);

  // Modal functions
  const openAddAmountModal = (goal) => {
    setModalType("addAmount");
    setActiveGoal(goal);
    setAmount("");
    if (modalRef.current) modalRef.current.showModal();
  };

  const openAddGoalModal = () => {
    setModalType("addGoal");
    setTitle("");
    setDescription("");
    setTargetAmount("");
    setCurrentAmount("");
    if (modalRef.current) modalRef.current.showModal();
  };

  const closeModal = () => {
    setModalType("");
    setActiveGoal(null);
    setAmount("");
    if (modalRef.current) modalRef.current.close();
  };

  const openDeleteGoalModal = (goalId) => {
    setDeleteGoalId(goalId);
    if (deleteModalRef.current) deleteModalRef.current.showModal();
  };

  const closeDeleteModal = () => {
    setDeleteGoalId(null);
    if (deleteModalRef.current) deleteModalRef.current.close();
  };

  const handleAddAmount = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/goal/update/${activeGoal._id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ addAmount: Number(amount) }),
        }
      );
      if (!response.ok) throw new Error("Failed to add amount");
      const data = await response.json();
      toast.success(data.message);
      dispatch(
        setGoals(
          goals.map((goal) =>
            goal._id === activeGoal._id
              ? { ...goal, currentAmount: goal.currentAmount + Number(amount) }
              : goal
          )
        )
      );
      closeModal();
    } catch (error) {
      toast.error("Failed to add amount.");
    }
  };

  const handleDeleteGoal = async () => {
    try {
      const response = await fetch(`${BASE_URL}/goal/delete/${deleteGoalId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        toast.error("Failed to delete goal.");
        return;
      }
      const data = await response.json();
      toast.success(data.message);
      dispatch(setGoals(goals.filter((goal) => goal._id !== deleteGoalId)));
      closeDeleteModal();
    } catch (error) {
      toast.error("Failed to delete goal.");
    }
  };

  const handleSaveGoal = async () => {
    if (
      !title ||
      !targetAmount ||
      isNaN(targetAmount) ||
      Number(targetAmount) <= 0
    ) {
      toast.error("Please fill in all fields correctly.");
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/goal/create`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          targetAmount: Number(targetAmount),
          currentAmount: Number(currentAmount),
        }),
      });
      if (!response.ok) throw new Error("Failed to create goal");
      const data = await response.json();
      toast.success(data.message);
      dispatch(setGoals([...goals, data.goal]));
      closeModal();
    } catch (error) {
      toast.error("Failed to create goal.");
    }
  };

  // Skeleton loader
  const SkeletonCard = () => (
    <div className="card w-full max-w-xs h-72 bg-base-200 animate-pulse shadow-md rounded-xl" />
  );

  return (
    <div className="p-6 min-h-screen bg-base-100">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">🎯 Your Goals</h1>
        <button onClick={openAddGoalModal} className="btn btn-primary btn-wide">
          + Create Goal
        </button>
      </div>

      {/* Goals List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center text-center py-16">
          <p className="text-lg font-semibold text-base-content">
            No goals yet
          </p>
          <p className="text-sm text-base-content opacity-80 mb-4">
            Start creating goals to track your progress.
          </p>
          {/* <button className="btn btn-primary" onClick={openAddGoalModal}>
            Create Your First Goal
          </button> */}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {goals.map((goal) => {
            const progress =
              goal.targetAmount > 0
                ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
                : 0;
            // Progress color
            let progressColor =
              progress < 50
                ? "progress-accent"
                : progress < 90
                ? "progress-primary"
                : "progress-success";
            return (
              <div
                key={goal._id}
                className="card w-full max-w-xs h-72 bg-base-100 shadow-xl border border-base-200 rounded-xl flex flex-col"
              >
                {/* Card Body */}
                <div className="card-body flex-1 flex flex-col justify-between">
                  {/* Title & Status */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <h2 className="card-title truncate">
                        {goal.title || "Untitled Goal"}
                      </h2>
                      {goal.isCompleted && (
                        <span className="badge badge-success badge-outline text-xs">
                          Completed
                        </span>
                      )}
                    </div>
                    <p className="text-sm opacity-80 line-clamp-2">
                      {goal.description || "No description provided."}
                    </p>
                  </div>

                  {/* Progress */}
                  <div>
                    <progress
                      className={`progress w-full ${progressColor}`}
                      value={progress}
                      max="100"
                    />
                    <div className="flex justify-between text-xs mt-1">
                      <span>₹{goal.currentAmount ?? 0}</span>
                      <span>{progress.toFixed(1)}%</span>
                      <span>₹{goal.targetAmount ?? 0}</span>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="text-xs text-base-content opacity-70">
                    <p>
                      {goal.startDate
                        ? new Date(goal.startDate).toLocaleDateString()
                        : "N/A"}
                    </p>
                    {goal.completedAt && (
                      <p>
                        Completed:{" "}
                        {new Date(goal.completedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="card-actions justify-end px-4 pb-4 border-t border-base-200">
                  <button
                    onClick={() => openAddAmountModal(goal)}
                    className="btn btn-sm btn-outline btn-square tooltip"
                    aria-label="Add Amount"
                    data-tip="Add Amount"
                    disabled={goal.isCompleted}
                  >
                    ➕
                  </button>
                  <button
                    onClick={() => openDeleteGoalModal(goal._id)}
                    className="btn btn-sm btn-error btn-square tooltip"
                    aria-label="Delete Goal"
                    data-tip="Delete Goal"
                  >
                    🗑
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Amount / Add Goal Modal */}
      <dialog id="goal-modal" className="modal" ref={modalRef}>
        <form method="dialog" className="modal-box max-w-md">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={closeModal}
            type="button"
            aria-label="Close"
          >
            ✕
          </button>
          {modalType === "addAmount" && activeGoal && (
            <>
              <h3 className="font-bold text-lg mb-3">
                Add Amount to "{activeGoal.title}"
              </h3>
              <p className="mb-2">
                Current: ₹{activeGoal.currentAmount} / Target: ₹
                {activeGoal.targetAmount}
              </p>
              <input
                type="number"
                placeholder="Enter amount"
                className="input input-bordered w-full mb-4"
                value={amount}
                min="1"
                onChange={(e) => setAmount(e.target.value)}
              />
              <button
                className="btn btn-primary w-full"
                type="button"
                onClick={handleAddAmount}
              >
                Add Amount
              </button>
            </>
          )}
          {modalType === "addGoal" && (
            <>
              <h3 className="font-bold text-lg mb-3">Add New Goal</h3>
              <input
                type="text"
                placeholder="Title"
                className="input input-bordered w-full mb-2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                type="text"
                placeholder="Description"
                className="input input-bordered w-full mb-2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <input
                type="number"
                placeholder="Target Amount"
                className="input input-bordered w-full mb-2"
                value={targetAmount}
                min="1"
                onChange={(e) => setTargetAmount(e.target.value)}
              />
              <input
                type="number"
                placeholder="Current Amount"
                className="input input-bordered w-full mb-4"
                value={currentAmount}
                min="0"
                max={targetAmount || 1000000}
                onChange={(e) => setCurrentAmount(e.target.value)}
              />
              <button
                className="btn btn-primary w-full"
                type="button"
                onClick={handleSaveGoal}
              >
                Add Goal
              </button>
            </>
          )}
        </form>
      </dialog>

      {/* Delete Confirmation Modal */}
      <dialog id="delete-modal" className="modal" ref={deleteModalRef}>
        <form method="dialog" className="modal-box max-w-sm">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            type="button"
            aria-label="Close"
            onClick={closeDeleteModal}
          >
            ✕
          </button>
          <h3 className="font-bold text-lg mb-4 text-error">Confirm Delete</h3>
          <p>Are you sure you want to delete this goal?</p>
          <div className="modal-action">
            <button className="btn" type="button" onClick={closeDeleteModal}>
              Cancel
            </button>
            <button
              className="btn btn-error"
              type="button"
              onClick={handleDeleteGoal}
            >
              Delete
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
};

export default Goal;
