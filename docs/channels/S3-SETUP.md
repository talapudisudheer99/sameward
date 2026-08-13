# AWS S3 setup (chat file uploads)

Same idea as Google Cloud Console for OAuth: you create the account resources once, put secrets in `.env.local`, never commit them.

**PO lock:** AWS S3 for TeamHub channel attachments (v1).  
Account setup below; **upload code is shipped** (presign → PUT → message attachments).

## Setup status

| Item | Status |
|------|--------|
| Region `ap-south-1` | ✅ |
| Bucket `teamhub-ai-dev-sudheer-2026` | ✅ private (block public access ON) |
| CORS `localhost:3000` | ✅ |
| IAM user `teamhub-ai-dev` | ✅ |
| `.env.local` (`AWS_REGION`, `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) | ✅ (secrets stay local) |
| Presign API + composer upload + transcript display | ✅ Shipped |

SDK + presigned upload live in `lib/storage/s3.ts` and channel upload routes.

---

| AWS thing | Purpose |
|-----------|---------|
| AWS account | Billing root (free tier eligible for new accounts; S3 has a free tier allowance) |
| S3 **bucket** | Where image/PDF bytes live |
| IAM **user** + access key | App credentials (like Google client id/secret) |
| Bucket **CORS** | Browser can PUT/GET from `http://localhost:3000` |

**v1 pattern:** bucket stays **private**; uploads/downloads use **presigned URLs** (time-limited). No “public bucket for the world.”

---

## Step-by-step (do this in order)

### 1) Create an AWS account
1. Go to [https://aws.amazon.com](https://aws.amazon.com) → Create account  
2. Root email + password + payment method (required even for free tier)  
3. Verify phone if asked  
4. Sign in to the **AWS Console**

### 2) Pick a region (and stick to it)
Examples: `ap-south-1` (Mumbai), `us-east-1` (N. Virginia).  
**Remember the region code** — it must match env `AWS_REGION`.

### 3) Create the S3 bucket
1. Console → search **S3** → **Create bucket**  
2. **Bucket name:** globally unique, e.g. `teamhub-ai-uploads-dev-<yourname>`  
3. **AWS Region:** same as step 2  
4. **Object Ownership:** ACLs disabled (default) is fine  
5. **Block Public Access:** leave **all blocks ON** (private bucket)  
6. Versioning: Off (v1)  
7. Encryption: SSE-S3 (default) is fine  
8. Create bucket  

### 4) CORS (so browser uploads from localhost work)
1. Open the bucket → **Permissions** → **CORS** → Edit  
2. Paste (adjust origin if needed):

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedOrigins": [
      "http://localhost:3000"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

Later for production, add your real `https://…` origin.

### 5) IAM user (do **not** use root access keys)
1. Console → search **IAM** → **Users** → **Create user**  
2. Name: e.g. `teamhub-s3-dev`  
3. **Attach policies directly** → **Create policy** (JSON) → paste (replace `YOUR_BUCKET_NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "TeamHubChatUploads",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    },
    {
      "Sid": "ListBucketOptional",
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME"
    }
  ]
}
```

4. Name the policy `TeamHubS3UploadsDev` → Create  
5. Back on the user: attach that policy → Create user  

### 6) Access key (this is your “client secret”)
1. Open the user → **Security credentials**  
2. **Create access key** → use case: **Application running outside AWS** (or “Local code”)  
3. Copy **Access key ID** and **Secret access key** **once** (secret is shown only now)  
4. Store them in `.env.local` — never Discord/email/git  

---

## What to put in `.env.local`

```bash
# AWS S3 (chat attachments)
AWS_REGION=ap-south-1
AWS_S3_BUCKET=teamhub-ai-uploads-dev-yourname
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

Names also live in root [`.env.example`](../../.env.example) (empty placeholders only).

---

## What to send me when done (safe checklist)

Paste **non-secret** confirmations like this:

```text
AWS S3 ready
- Region: ap-south-1
- Bucket: teamhub-ai-uploads-dev-…
- Block public access: ON
- CORS: localhost:3000 GET/PUT/HEAD
- IAM user: teamhub-s3-dev
- Policy: PutObject/GetObject/DeleteObject on bucket/*
- .env.local keys set: AWS_REGION, AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
```

**Do not paste** `AWS_SECRET_ACCESS_KEY` into chat.  
Say only: “secret is in `.env.local`.”

---

## Cost / safety notes

- Keep the bucket **private**  
- Rotate/delete access keys if leaked  
- Free-tier limits exist; for learning, traffic stays tiny  
- We still enforce app limits: **10 MB · max 3 files · jpeg/png/webp/gif/pdf**

---

[← Channels tasks](./TASKS.md) · [VISION file limits](./VISION.md)
