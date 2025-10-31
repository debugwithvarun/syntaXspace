import { ChevronDownIcon } from "lucide-react"
import { Accordion as AccordionPrimitive } from "radix-ui"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion"


type articleProps = {
  headline: string;
  desc: string;
  author: string;
};

export default function NewsField({ items }: { items: articleProps[] }) {
  return (
    <div className="w-full max-w-[300px] pl-6">
      <Accordion type="single" collapsible className="w-full space-y-2">
        {items.map((item, idx) => (
          <AccordionItem 
            value={`${idx}`} 
            key={idx} 
            className=" px-3 py-1.5 "
          >
            <AccordionPrimitive.Header className="flex">
              <AccordionPrimitive.Trigger 
                className="flex flex-1 items-start justify-between gap-2 py-1.5 text-left transition-all outline-none group hover:opacity-80"
              >
                <div className="flex-1 min-w-0 space-y-0.5">
                  <h4 className="text-xs font-medium leading-tight text-foreground wrap-break-words">
                    {item.headline}
                  </h4>
                  {item.author && (
                    <p className="text-[10px] text-muted-foreground truncate">
                      {item.author}
                    </p>
                  )}
                </div>
                <ChevronDownIcon
                  size={14}
                  className="shrink-0 mt-0.5 opacity-50 transition-transform duration-200 group-data-[state=open]:rotate-180"
                  aria-hidden="true"
                />
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>
            <AccordionContent className="pt-1 pb-2 text-[11px] leading-relaxed text-muted-foreground wrap-break-words">
              {item.desc}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
