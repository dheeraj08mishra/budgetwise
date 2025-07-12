// const Tags = ({ tags, setTags }) => {
//   const [allTags, setAllTags] = useState([]);

//   useEffect(() => {
//     const fetchTags = async () => {
//       try {
//         const res = await fetch(`${BASE_URL}/allTags`, {
//           method: "GET",
//           headers: { "Content-Type": "application/json" },
//           credentials: "include",
//         });
//         const data = await res.json();
//         if (res.ok && data?.data) {
//           console.log(data.data);
//           setAllTags(data.data);
//         }
//       } catch (error) {
//         console.error("Failed to fetch tags:", error);
//       }
//     };

//     fetchTags();
//   }, []);

//   const handleSelectChange = (e) => {
//     const selected = Array.from(
//       e.target.selectedOptions,
//       (option) => option.value
//     );
//     setTags(selected);
//   };

//   const removeTag = (tagToRemove) => {
//     setTags(tags.filter((tag) => tag !== tagToRemove));
//   };

//   return (
//     <div className="form-control w-full">
//       <label className="label">
//         <span className="label-text font-semibold text-sm">Tags</span>
//       </label>

//       <select
//         multiple
//         className="select select-neutral w-full rounded-xl h-32"
//         value={tags}
//         onChange={handleSelectChange}
//       >
//         {allTags.map((tag) => (
//           <option key={tag} value={tag}>
//             {tag}
//           </option>
//         ))}
//       </select>

//       {/* Display selected tags as DaisyUI badges */}
//       {/* <div className="mt-2 flex flex-wrap gap-2">
//         {tags.map((tag) => (
//           <div
//             key={tag}
//             className="badge badge-info badge-outline px-3 py-2 text-sm rounded-xl"
//           >
//             {tag}
//             <button className="ml-2 " onClick={() => removeTag(tag)}>
//               ✕
//             </button>
//           </div>
//         ))}
//       </div> */}
//     </div>
//   );
// };

// export default Tags;

import React, { useEffect, useState } from "react";
import { BASE_URL } from "../utils/constants";

const Tags = () => {
  const [tags, setTags] = useState([]);
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch(`${BASE_URL}/allTags`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        const tagValues = await response.json();
        if (response.ok) {
          const tags = tagValues.data || [];
          setTags(tags);
        }
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };
    fetchTags();
  }, []);
  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text text-sm font-semibold">Tags</span>
      </label>
      <select className="select select-neutral w-full rounded-xl">
        {tags.map((tag, index) => {
          return (
            <option key={index} value={tag}>
              {tag}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default Tags;
