import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

import { cn } from "@/lib/utils"

export interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}
const Pagination: React.FC<PaginationProps> = ({ className, ...props }) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
)
Pagination.displayName = "Pagination"

export interface PaginationContentProps extends React.HTMLAttributes<HTMLUListElement> {
  className?: string;
}
const PaginationContent = React.forwardRef<HTMLUListElement, PaginationContentProps>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
))
PaginationContent.displayName = "PaginationContent"

export interface PaginationItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  className?: string;
}
const PaginationItem = React.forwardRef<HTMLLIElement, PaginationItemProps>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

export interface PaginationLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  className?: string;
  isActive?: boolean;
  size?: string;
  children?: React.ReactNode;
}
const PaginationLink: React.FC<PaginationLinkProps> = ({
  className,
  isActive,
  size = "icon",
  children,
  ...props
}) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      "flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
      {
        "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground": isActive,
      },
      className
    )}
    {...props}
  >
    {children}
  </a>
)
PaginationLink.displayName = "PaginationLink"

export interface PaginationPreviousProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  className?: string;
}
const PaginationPrevious: React.FC<PaginationPreviousProps> = ({ className, ...props }) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn("gap-1", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
  </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"

export interface PaginationNextProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  className?: string;
}
const PaginationNext: React.FC<PaginationNextProps> = ({ className, ...props }) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn("gap-1", className)}
    {...props}
  >
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"

export interface PaginationEllipsisProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
}
const PaginationEllipsis: React.FC<PaginationEllipsisProps> = ({ className, ...props }) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
