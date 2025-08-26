import React from "react";

interface User {
  userID: number;
  fullName: string;
  avatar?: string | null;
}

interface Props {
  users: User[];
  selectedUserId: number | null;
  onSelect: (user: User) => void;
}

const UserList: React.FC<Props> = ({ users, selectedUserId, onSelect }) => {
  return (
    <div className="p-4">
      <h3 className="font-semibold mb-2">Chats</h3>
      <ul>
        {users.map((u) => (
          <li
            key={u.userID}
            className={`p-2 rounded cursor-pointer mb-1 ${
              selectedUserId === u.userID ? "bg-slate-200" : "hover:bg-slate-100"
            }`}
            onClick={() => onSelect(u)}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-300 rounded-full mr-3 flex items-center justify-center">
                {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full rounded-full" /> : u.fullName.charAt(0)}
              </div>
              <div>{u.fullName}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;