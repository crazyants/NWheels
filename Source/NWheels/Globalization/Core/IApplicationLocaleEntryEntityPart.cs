﻿using NWheels.DataObjects;
using NWheels.Entities;

namespace NWheels.Globalization.Core
{
    [EntityPartContract]
    public interface IApplicationLocaleEntryEntityPart
    {
        [PropertyContract.Required]
        string StringId { get; set; }

        string Origin { get; set; }

        [PropertyContract.Required]
        string Translation { get; set; }
    }
}
