import type {
  BorrowRequest,
  BorrowRequestStatus,
  Notification,
  NotificationType,
  Resource,
  ResourceCategory,
  ResourceCondition,
  ResourceStatus,
  User,
} from "@/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function str(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function optStr(value: unknown): string | undefined {
  const s = str(value);
  return s.length > 0 ? s : undefined;
}

function bool(value: unknown): boolean {
  return Boolean(value);
}

// ---------------------------------------------------------------------------
// Category mapper
// ---------------------------------------------------------------------------

const CATEGORY_MAP: Record<string, ResourceCategory> = {
  scripts: "scripts",
  "lesson-plans": "lesson-plans",
  costumes: "costumes",
  props: "props",
  lighting: "lighting",
  sound: "sound",
  "set-design": "set-design",
  makeup: "makeup",
  music: "music",
  other: "other",
};

function mapCategory(
  categoryId?: unknown,
  categoryName?: unknown
): ResourceCategory {
  const name = str(categoryName).toLowerCase().trim().replace(/_/g, "-");
  if (CATEGORY_MAP[name]) return CATEGORY_MAP[name];

  const id = str(categoryId).toLowerCase().trim().replace(/_/g, "-");
  if (CATEGORY_MAP[id]) return CATEGORY_MAP[id];

  return "other";
}

// ---------------------------------------------------------------------------
// Condition mapper
// ---------------------------------------------------------------------------

function mapCondition(condition?: unknown): ResourceCondition {
  const raw = str(condition).toLowerCase();
  if (raw === "poor") return "worn";
  if (["excellent", "good", "fair", "worn"].includes(raw)) {
    return raw as ResourceCondition;
  }
  return "good";
}

// ---------------------------------------------------------------------------
// Status mapper
// ---------------------------------------------------------------------------

function mapStatus(item: Record<string, unknown>): ResourceStatus {
  const isActive = bool(item.is_active ?? item.isActive);
  const qty = Number(item.quantity_available ?? item.quantityAvailable ?? 1);

  if (!isActive) return "unavailable";
  if (qty <= 0) return "borrowed";
  return "available";
}

// ---------------------------------------------------------------------------
// User stub
// ---------------------------------------------------------------------------

function stubUser(record: Record<string, unknown>): User {
  const firstName = str(record.first_name ?? record.firstName);
  const lastName = str(record.last_name ?? record.lastName);
  const displayName =
    str(record.name) ||
    [firstName, lastName].filter(Boolean).join(" ") ||
    str(record.email);

  const school =
    optStr(record.school_name ?? record.schoolName ?? record.school) ??
    optStr(record.school_id ?? record.schoolId);

  return {
    id: str(record.id),
    email: str(record.email),
    name: displayName,
    avatar: optStr(record.avatar_url ?? record.avatarUrl ?? record.avatar),
    school,
    schoolName: school,
    role: optStr(record.role),
    bio: optStr(record.bio),
    joinedAt: str(record.created_at ?? record.createdAt ?? new Date().toISOString()),
    resourcesShared: 0,
    resourcesBorrowed: 0,
    matrixUserId: optStr(record.matrix_user_id ?? record.matrixUserId),
    matrixAccessToken: optStr(record.matrix_access_token ?? record.matrixAccessToken),
    matrixDeviceId: optStr(record.matrix_device_id ?? record.matrixDeviceId),
  };
}

// ---------------------------------------------------------------------------
// Item mapper
// ---------------------------------------------------------------------------

export function mapItem(item: unknown): Resource {
  const record = asRecord(item) ?? {};

  const images: string[] = [];
  const primary = optStr(record.primary_image_url ?? record.primaryImageUrl);
  if (primary) images.push(primary);

  const imgList = record.images ?? record.image_urls ?? record.imageUrls;
  if (Array.isArray(imgList)) {
    for (const img of imgList) {
      const imgRecord = asRecord(img);
      const url = optStr(imgRecord?.image_url ?? imgRecord?.url ?? img);
      if (url) images.push(url);
    }
  }

  const ownerRecord = asRecord(record.owner ?? record.school);
  const owner = ownerRecord ? stubUser(ownerRecord) : undefined;

  return {
    id: str(record.id),
    title: str(record.name ?? record.title),
    description: str(record.description),
    category: mapCategory(record.category_id ?? record.categoryId, record.category_name ?? record.categoryName),
    condition: mapCondition(record.condition),
    status: mapStatus(record),
    images,
    tags: Array.isArray(record.tags) ? record.tags.map(str) : [],
    ownerId: str(record.school_id ?? record.schoolId ?? record.owner_id ?? record.ownerId),
    owner: owner ?? {
      id: "",
      email: "",
      name: str(record.school_name ?? record.schoolName ?? ""),
      joinedAt: "",
      resourcesShared: 0,
      resourcesBorrowed: 0,
    },
    createdAt: str(record.created_at ?? record.createdAt),
    updatedAt: str(record.updated_at ?? record.updatedAt),
    borrowCount: Number(record.borrow_count ?? record.borrowCount ?? 0),
    rating: Number(record.rating ?? 0),
    reviewCount: Number(record.review_count ?? record.reviewCount ?? 0),
  };
}

// ---------------------------------------------------------------------------
// Borrow request mapper
// ---------------------------------------------------------------------------

export function mapBorrowRequest(backend: unknown): BorrowRequest {
  const b = asRecord(backend) ?? {};

  const resourceRecord = asRecord(b.item ?? b.resource);
  const resource = resourceRecord ? mapItem(resourceRecord) : undefined;

  const borrowerRecord = asRecord(b.borrower ?? b.requester);
  const borrower = borrowerRecord ? stubUser(borrowerRecord) : undefined;

  const ownerRecord = asRecord(b.owner ?? b.owner_school);
  const owner = ownerRecord ? stubUser(ownerRecord) : undefined;

  return {
    id: str(b.id),
    resourceId: str(b.item_id ?? b.itemId ?? b.resource_id ?? b.resourceId),
    resource:
      resource ?? {
        id: str(b.item_id ?? b.itemId ?? ""),
        title: str(b.item_name ?? b.itemName ?? ""),
        description: str(b.item_description ?? b.itemDescription ?? ""),
        category: "other",
        condition: "good",
        status: "available",
        images: [],
        tags: [],
        ownerId: "",
        owner: { id: "", email: "", name: "", joinedAt: "", resourcesShared: 0, resourcesBorrowed: 0 },
        createdAt: "",
        updatedAt: "",
        borrowCount: 0,
        rating: 0,
        reviewCount: 0,
      },
    borrowerId: str(b.requester_id ?? b.requesterId ?? b.borrower_id ?? b.borrowerId),
    borrower:
      borrower ?? {
        id: str(b.requester_id ?? b.requesterId ?? ""),
        email: "",
        name: [str(b.requester_first_name ?? b.requesterFirstName), str(b.requester_last_name ?? b.requesterLastName)]
          .filter(Boolean)
          .join(" "),
        joinedAt: "",
        resourcesShared: 0,
        resourcesBorrowed: 0,
      },
    ownerId: str(b.owner_school_id ?? b.ownerSchoolId ?? b.owner_id ?? b.ownerId),
    owner:
      owner ?? {
        id: str(b.owner_school_id ?? b.ownerSchoolId ?? ""),
        email: "",
        name: [str(b.owner_first_name ?? b.ownerFirstName), str(b.owner_last_name ?? b.ownerLastName)]
          .filter(Boolean)
          .join(" "),
        joinedAt: "",
        resourcesShared: 0,
        resourcesBorrowed: 0,
      },
    status: (str(b.status) as BorrowRequestStatus) || "pending",
    requestedAt: str(b.created_at ?? b.createdAt),
    startDate: str(b.requested_date ?? b.requestedDate ?? b.start_date ?? b.startDate ?? b.created_at ?? b.createdAt),
    endDate: str(b.return_date ?? b.returnDate ?? b.end_date ?? b.endDate),
    returnedAt: optStr(b.returned_at ?? b.returnedAt),
    message: optStr(b.requester_note ?? b.requesterNote ?? b.message),
    ownerResponse: optStr(b.owner_note ?? b.ownerNote ?? b.owner_response ?? b.ownerResponse),
    ownerMatrixUserId: optStr(b.owner_matrix_user_id ?? b.ownerMatrixUserId),
    matrixRoomId: optStr(b.matrix_room_id ?? b.matrixRoomId),
  };
}

// ---------------------------------------------------------------------------
// Notification mapper
// ---------------------------------------------------------------------------

export function mapNotification(backend: unknown): Notification {
  const b = asRecord(backend) ?? {};

  return {
    id: str(b.id),
    type: (str(b.type) as NotificationType) || "borrow_request",
    title: str(b.title),
    message: str(b.body ?? b.message),
    read: bool(b.is_read ?? b.isRead ?? b.read),
    createdAt: str(b.created_at ?? b.createdAt),
    actionUrl: optStr(b.link ?? b.actionUrl),
    resourceId: optStr(b.resource_id ?? b.resourceId ?? b.item_id ?? b.itemId),
    userId: optStr(b.user_id ?? b.userId),
  };
}
